const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/your_database'
});

async function verifyMortgageStep1Dropdowns() {
  console.log('🔍 Verifying Mortgage Step 1 Dropdown Component Types...\n');
  
  try {
    // 1. Check current state of main dropdown fields
    console.log('📋 Checking main dropdown fields:');
    const mainDropdowns = await pool.query(`
      SELECT content_key, component_type
      FROM content_items 
      WHERE content_key IN (
        'calculate_mortgage_debt_types',
        'calculate_mortgage_family_status', 
        'calculate_mortgage_main_source',
        'calculate_mortgage_when',
        'calculate_mortgage_first',
        'calculate_mortgage_has_additional'
      )
      ORDER BY content_key
    `);
    
    mainDropdowns.rows.forEach(row => {
      const status = row.component_type === 'dropdown' ? '✅' : '❌';
      console.log(`${status} ${row.content_key}: ${row.component_type}`);
    });

    // 2. Check current state of dropdown options
    console.log('\n📋 Checking dropdown options:');
    const dropdownOptions = await pool.query(`
      SELECT content_key, component_type
      FROM content_items 
      WHERE content_key IN (
        'calculate_mortgage_first_options_1',
        'calculate_mortgage_first_options_2',
        'calculate_mortgage_first_options_3',
        'calculate_mortgage_when_options_1',
        'calculate_mortgage_when_options_2', 
        'calculate_mortgage_when_options_3',
        'calculate_mortgage_when_options_4',
        'calculate_mortgage_when_options_Time'
      )
      ORDER BY content_key
    `);
    
    dropdownOptions.rows.forEach(row => {
      const status = row.component_type === 'option' ? '✅' : '❌';
      console.log(`${status} ${row.content_key}: ${row.component_type}`);
    });

    // 3. Test API endpoints
    console.log('\n🔗 Testing API endpoints:');
    
    const testEndpoints = [
      'calculate_mortgage_debt_types',
      'calculate_mortgage_family_status',
      'calculate_mortgage_main_source',
      'calculate_mortgage_when',
      'calculate_mortgage_first',
      'calculate_mortgage_has_additional'
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(`http://localhost:3001/api/content/mortgage/${endpoint}/options`);
        const data = await response.json();
        const optionCount = data.data ? data.data.length : 0;
        console.log(`📊 ${endpoint}/options: ${optionCount} options`);
      } catch (error) {
        console.log(`❌ ${endpoint}/options: Error - ${error.message}`);
      }
    }

    // 4. Check drill page data
    console.log('\n📋 Checking drill page data:');
    try {
      const response = await fetch('http://localhost:3001/api/content/mortgage/drill/mortgage_step1');
      const data = await response.json();
      
      if (data.success && data.data) {
        const dropdownActions = data.data.actions.filter(action => 
          action.component_type === 'dropdown'
        );
        const optionActions = data.data.actions.filter(action => 
          action.component_type === 'option'
        );
        
        console.log(`✅ Drill page shows ${dropdownActions.length} dropdown actions`);
        console.log(`✅ Drill page shows ${optionActions.length} option actions (should be 0 after fix)`);
        
        dropdownActions.forEach(action => {
          console.log(`   - ${action.content_key}: ${action.translations?.he || action.translations?.ru || action.content_key}`);
        });
      }
    } catch (error) {
      console.log(`❌ Drill page check failed: ${error.message}`);
    }

    // 5. Summary
    console.log('\n📊 SUMMARY:');
    const totalMainDropdowns = mainDropdowns.rows.length;
    const correctMainDropdowns = mainDropdowns.rows.filter(row => row.component_type === 'dropdown').length;
    const totalOptions = dropdownOptions.rows.length;
    const correctOptions = dropdownOptions.rows.filter(row => row.component_type === 'option').length;
    
    console.log(`Main Dropdowns: ${correctMainDropdowns}/${totalMainDropdowns} correct`);
    console.log(`Dropdown Options: ${correctOptions}/${totalOptions} correct`);
    
    if (correctMainDropdowns === totalMainDropdowns && correctOptions === totalOptions) {
      console.log('\n🎉 All dropdown component types are correct!');
    } else {
      console.log('\n⚠️  Some dropdown component types need fixing.');
      console.log('Run the migration script to fix them.');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await pool.end();
  }
}

verifyMortgageStep1Dropdowns(); 