#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false }
});

async function generateComprehensiveReport() {
  console.log('📊 COMPREHENSIVE TRANSLATION COMPLETION REPORT\n');
  
  // 1. Overall database statistics
  console.log('🔍 OVERALL STATISTICS:');
  
  const overallQuery = `
    SELECT 
      COUNT(DISTINCT ci.id) as total_content_items,
      COUNT(DISTINCT ci.screen_location) as total_screens,
      COUNT(ct.id) as total_translations,
      SUM(CASE WHEN ct.id IS NOT NULL THEN 1 ELSE 0 END) as items_with_translations,
      SUM(CASE WHEN ct.content_value LIKE '%Translation missing%' THEN 1 ELSE 0 END) as translations_with_missing_flags
    FROM content_items ci
    LEFT JOIN content_translations ct ON ci.id = ct.content_item_id 
      AND ct.status IN ('approved', 'draft')
    WHERE ci.is_active = TRUE
  `;
  
  const overallResult = await pool.query(overallQuery);
  const stats = overallResult.rows[0];
  
  console.log(`Total content items: ${stats.total_content_items}`);
  console.log(`Total unique screens: ${stats.total_screens}`);
  console.log(`Total translations: ${stats.total_translations}`);
  console.log(`Expected translations (3 per item): ${parseInt(stats.total_content_items) * 3}`);
  console.log(`Translation completeness: ${Math.round((stats.total_translations / (parseInt(stats.total_content_items) * 3)) * 100)}%`);
  console.log(`Items with "Translation missing" flags: ${stats.translations_with_missing_flags}\n`);
  
  // 2. Screen-by-screen completion status
  console.log('📍 SCREEN COMPLETION STATUS:\n');
  
  const screenStatsQuery = `
    WITH screen_stats AS (
      SELECT 
        ci.screen_location,
        COUNT(ci.id) as total_items,
        COUNT(ct.id) as total_translations,
        COUNT(CASE WHEN ct.content_value LIKE '%Translation missing%' THEN 1 END) as missing_flag_count,
        CAST((COUNT(ct.id)::float / (COUNT(ci.id) * 3)) * 100 AS NUMERIC(5,1)) as completion_percentage
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id 
        AND ct.status IN ('approved', 'draft')
      WHERE ci.is_active = TRUE 
        AND ci.screen_location IS NOT NULL 
        AND ci.screen_location != ''
      GROUP BY ci.screen_location
    )
    SELECT 
      screen_location,
      total_items,
      total_translations,
      missing_flag_count,
      completion_percentage,
      CASE 
        WHEN completion_percentage = 100 AND missing_flag_count = 0 THEN 'COMPLETE'
        WHEN completion_percentage >= 90 THEN 'MOSTLY_COMPLETE'
        WHEN completion_percentage >= 50 THEN 'PARTIAL'
        ELSE 'NEEDS_WORK'
      END as status
    FROM screen_stats
    ORDER BY 
      CASE status 
        WHEN 'COMPLETE' THEN 1 
        WHEN 'MOSTLY_COMPLETE' THEN 2 
        WHEN 'PARTIAL' THEN 3 
        ELSE 4 
      END,
      completion_percentage DESC,
      screen_location
  `;
  
  const screenStatsResult = await pool.query(screenStatsQuery);
  
  // Group by status for better reporting
  const statusGroups = {
    'COMPLETE': [],
    'MOSTLY_COMPLETE': [],
    'PARTIAL': [],
    'NEEDS_WORK': []
  };
  
  for (const screen of screenStatsResult.rows) {
    statusGroups[screen.status].push(screen);
  }
  
  console.log('✅ COMPLETE SCREENS (100% translated, no issues):');
  if (statusGroups.COMPLETE.length > 0) {
    statusGroups.COMPLETE.forEach(screen => {
      console.log(`   ${screen.screen_location}: ${screen.total_items} items, ${screen.total_translations} translations`);
    });
  } else {
    console.log('   None yet');
  }
  console.log(`   Total: ${statusGroups.COMPLETE.length} screens\n`);
  
  console.log('🔶 MOSTLY COMPLETE SCREENS (90%+ translated):');
  if (statusGroups.MOSTLY_COMPLETE.length > 0) {
    statusGroups.MOSTLY_COMPLETE.forEach(screen => {
      console.log(`   ${screen.screen_location}: ${screen.completion_percentage}% (${screen.total_translations}/${screen.total_items * 3})`);
      if (screen.missing_flag_count > 0) {
        console.log(`     ⚠️  ${screen.missing_flag_count} "Translation missing" flags`);
      }
    });
  } else {
    console.log('   None');
  }
  console.log(`   Total: ${statusGroups.MOSTLY_COMPLETE.length} screens\n`);
  
  console.log('🔸 PARTIALLY COMPLETE SCREENS (50-90% translated):');
  if (statusGroups.PARTIAL.length > 0 && statusGroups.PARTIAL.length <= 20) {
    statusGroups.PARTIAL.forEach(screen => {
      console.log(`   ${screen.screen_location}: ${screen.completion_percentage}% (${screen.total_translations}/${screen.total_items * 3})`);
    });
  } else if (statusGroups.PARTIAL.length > 20) {
    console.log(`   ${statusGroups.PARTIAL.length} screens (too many to list individually)`);
    console.log('   Top 5 most complete:');
    statusGroups.PARTIAL.slice(0, 5).forEach(screen => {
      console.log(`     ${screen.screen_location}: ${screen.completion_percentage}%`);
    });
  } else {
    console.log('   None');
  }
  console.log(`   Total: ${statusGroups.PARTIAL.length} screens\n`);
  
  console.log('🔴 SCREENS NEEDING WORK (<50% translated):');
  if (statusGroups.NEEDS_WORK.length > 0 && statusGroups.NEEDS_WORK.length <= 20) {
    statusGroups.NEEDS_WORK.forEach(screen => {
      console.log(`   ${screen.screen_location}: ${screen.completion_percentage}% (${screen.total_translations}/${screen.total_items * 3})`);
    });
  } else if (statusGroups.NEEDS_WORK.length > 20) {
    console.log(`   ${statusGroups.NEEDS_WORK.length} screens (too many to list individually)`);
    console.log('   Top 5 most complete:');
    statusGroups.NEEDS_WORK.slice(0, 5).forEach(screen => {
      console.log(`     ${screen.screen_location}: ${screen.completion_percentage}%`);
    });
  } else {
    console.log('   None');
  }
  console.log(`   Total: ${statusGroups.NEEDS_WORK.length} screens\n`);
  
  // 3. Specific check for originally reported screen
  console.log('🎯 SPECIFIC VERIFICATION: credit_refi_program_selection');
  const specificScreen = screenStatsResult.rows.find(s => s.screen_location === 'credit_refi_program_selection');
  if (specificScreen) {
    console.log(`Status: ${specificScreen.status}`);
    console.log(`Completion: ${specificScreen.completion_percentage}%`);
    console.log(`Items: ${specificScreen.total_items}`);
    console.log(`Translations: ${specificScreen.total_translations}/${specificScreen.total_items * 3}`);
    console.log(`Missing flags: ${specificScreen.missing_flag_count}`);
    
    if (specificScreen.status === 'COMPLETE') {
      console.log('✅ RESOLVED: The originally reported issue has been completely fixed!');
    } else {
      console.log('⚠️  Still needs attention');
    }
  } else {
    console.log('❌ Screen not found in database');
  }
  
  // 4. Summary recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  const totalIncomplete = statusGroups.MOSTLY_COMPLETE.length + statusGroups.PARTIAL.length + statusGroups.NEEDS_WORK.length;
  
  if (totalIncomplete === 0) {
    console.log('🎉 All screens have complete translations! No further action needed.');
  } else {
    console.log(`📋 ${totalIncomplete} screens still need translation work`);
    
    if (statusGroups.NEEDS_WORK.length > 0) {
      console.log(`1. Priority: Fix ${statusGroups.NEEDS_WORK.length} screens with <50% completion`);
    }
    
    if (statusGroups.PARTIAL.length > 0) {
      console.log(`2. Next: Complete ${statusGroups.PARTIAL.length} partially translated screens`);
    }
    
    if (statusGroups.MOSTLY_COMPLETE.length > 0) {
      console.log(`3. Polish: Final touches for ${statusGroups.MOSTLY_COMPLETE.length} mostly complete screens`);
    }
    
    console.log(`4. Run batch fix script to continue automated translation creation`);
    console.log(`5. Review and improve auto-generated translations for quality`);
  }
  
  return {
    totalScreens: screenStatsResult.rows.length,
    completeScreens: statusGroups.COMPLETE.length,
    incompleteScreens: totalIncomplete,
    overallCompletion: Math.round((stats.total_translations / (parseInt(stats.total_content_items) * 3)) * 100)
  };
}

async function main() {
  try {
    const summary = await generateComprehensiveReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 EXECUTIVE SUMMARY:');
    console.log(`Overall translation completion: ${summary.overallCompletion}%`);
    console.log(`Screens with complete translations: ${summary.completeScreens}/${summary.totalScreens}`);
    console.log(`Screens needing work: ${summary.incompleteScreens}`);
    
    if (summary.completeScreens === summary.totalScreens) {
      console.log('🎊 STATUS: ALL TRANSLATIONS COMPLETE!');
    } else if (summary.overallCompletion >= 90) {
      console.log('🟢 STATUS: NEARLY COMPLETE - Final polish needed');
    } else if (summary.overallCompletion >= 70) {
      console.log('🟡 STATUS: GOOD PROGRESS - Continue batch processing');
    } else {
      console.log('🔴 STATUS: SIGNIFICANT WORK NEEDED - Run batch fix scripts');
    }
    
  } catch (error) {
    console.error('💥 Report generation failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateComprehensiveReport };