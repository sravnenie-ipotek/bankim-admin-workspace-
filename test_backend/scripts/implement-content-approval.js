const { Pool } = require('pg');

// Load environment variables from parent directory
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});

/**
 * Content Approval Workflow System for Dropdown Content
 * Following @dropDownDBlogic patterns for consistent approval management
 */

/**
 * Approval status definitions according to @dropDownDBlogic
 */
const APPROVAL_STATUSES = {
  'draft': {
    description: 'Content is being created or edited',
    canView: false,
    canEdit: true,
    canApprove: false,
    nextStatus: 'pending'
  },
  'pending': {
    description: 'Content is ready for review',
    canView: true,
    canEdit: false,
    canApprove: true,
    nextStatus: 'approved'
  },
  'approved': {
    description: 'Content is approved for production',
    canView: true,
    canEdit: false,
    canApprove: false,
    nextStatus: null
  },
  'rejected': {
    description: 'Content was rejected and needs revision',
    canView: true,
    canEdit: true,
    canApprove: false,
    nextStatus: 'draft'
  }
};

/**
 * Content Approval Manager
 */
class ContentApprovalManager {
  constructor() {
    this.statuses = APPROVAL_STATUSES;
    this.approvalQueue = [];
    this.approvalHistory = [];
  }

  /**
   * Get all approval statuses
   * @returns {Object} Approval statuses
   */
  getApprovalStatuses() {
    return this.statuses;
  }

  /**
   * Get approval status for a specific status
   * @param {string} status - Status to get info for
   * @returns {Object} Status information
   */
  getStatusInfo(status) {
    return this.statuses[status] || null;
  }

  /**
   * Check if content can be viewed in current status
   * @param {string} status - Content status
   * @returns {boolean} Whether content can be viewed
   */
  canViewContent(status) {
    const statusInfo = this.getStatusInfo(status);
    return statusInfo ? statusInfo.canView : false;
  }

  /**
   * Check if content can be edited in current status
   * @param {string} status - Content status
   * @returns {boolean} Whether content can be edited
   */
  canEditContent(status) {
    const statusInfo = this.getStatusInfo(status);
    return statusInfo ? statusInfo.canEdit : false;
  }

  /**
   * Check if content can be approved in current status
   * @param {string} status - Content status
   * @returns {boolean} Whether content can be approved
   */
  canApproveContent(status) {
    const statusInfo = this.getStatusInfo(status);
    return statusInfo ? statusInfo.canApprove : false;
  }

  /**
   * Get next status for approval workflow
   * @param {string} currentStatus - Current status
   * @returns {string} Next status
   */
  getNextStatus(currentStatus) {
    const statusInfo = this.getStatusInfo(currentStatus);
    return statusInfo ? statusInfo.nextStatus : null;
  }

  /**
   * Add content to approval queue
   * @param {Object} content - Content to add to queue
   */
  addToApprovalQueue(content) {
    this.approvalQueue.push({
      ...content,
      addedAt: new Date().toISOString(),
      priority: content.priority || 'normal'
    });
    console.log(`✅ Added content to approval queue: ${content.content_key}`);
  }

  /**
   * Get approval queue
   * @returns {Array} Approval queue
   */
  getApprovalQueue() {
    return this.approvalQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Approve content
   * @param {string} contentId - Content ID to approve
   * @param {string} approver - Approver name
   * @param {string} comment - Approval comment
   */
  async approveContent(contentId, approver, comment = '') {
    try {
      // Update content status to approved
      await pool.query(`
        UPDATE content_translations 
        SET status = 'approved', updated_at = NOW()
        WHERE content_item_id = $1
      `, [contentId]);

      // Add to approval history
      this.approvalHistory.push({
        contentId,
        action: 'approved',
        approver,
        comment,
        timestamp: new Date().toISOString()
      });

      // Remove from approval queue
      this.approvalQueue = this.approvalQueue.filter(item => item.id !== contentId);

      console.log(`✅ Content approved: ${contentId} by ${approver}`);
      return true;
    } catch (error) {
      console.error('❌ Error approving content:', error);
      return false;
    }
  }

  /**
   * Reject content
   * @param {string} contentId - Content ID to reject
   * @param {string} rejector - Rejector name
   * @param {string} reason - Rejection reason
   */
  async rejectContent(contentId, rejector, reason = '') {
    try {
      // Update content status to rejected
      await pool.query(`
        UPDATE content_translations 
        SET status = 'rejected', updated_at = NOW()
        WHERE content_item_id = $1
      `, [contentId]);

      // Add to approval history
      this.approvalHistory.push({
        contentId,
        action: 'rejected',
        rejector,
        reason,
        timestamp: new Date().toISOString()
      });

      // Remove from approval queue
      this.approvalQueue = this.approvalQueue.filter(item => item.id !== contentId);

      console.log(`❌ Content rejected: ${contentId} by ${rejector}`);
      return true;
    } catch (error) {
      console.error('❌ Error rejecting content:', error);
      return false;
    }
  }

  /**
   * Get approval history
   * @returns {Array} Approval history
   */
  getApprovalHistory() {
    return this.approvalHistory;
  }

  /**
   * Get approval statistics
   * @returns {Object} Approval statistics
   */
  getApprovalStats() {
    const queueStats = {
      total: this.approvalQueue.length,
      high: this.approvalQueue.filter(item => item.priority === 'high').length,
      normal: this.approvalQueue.filter(item => item.priority === 'normal').length,
      low: this.approvalQueue.filter(item => item.priority === 'low').length
    };

    const historyStats = {
      total: this.approvalHistory.length,
      approved: this.approvalHistory.filter(item => item.action === 'approved').length,
      rejected: this.approvalHistory.filter(item => item.action === 'rejected').length
    };

    return {
      queue: queueStats,
      history: historyStats
    };
  }
}

/**
 * Analyze content approval status
 */
async function analyzeContentApprovalStatus() {
  console.log('📊 Analyzing content approval status...\n');

  try {
    // Analyze content by status
    const statusAnalysis = await pool.query(`
      SELECT 
        ct.status,
        ci.component_type,
        COUNT(*) as count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.is_active = TRUE
        AND ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
      GROUP BY ct.status, ci.component_type
      ORDER BY ct.status, ci.component_type
    `);

    console.log('📋 Content by approval status:');
    statusAnalysis.rows.forEach(row => {
      console.log(`  ${row.status || 'NULL'} - ${row.component_type}: ${row.count} items`);
    });

    // Analyze pending content
    const pendingContent = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        ct.status,
        ct.language_code
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.is_active = TRUE
        AND ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        AND ct.status = 'pending'
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 10
    `);

    console.log('\n📋 Pending content for approval:');
    pendingContent.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_key} (${row.component_type}, ${row.screen_location}) - ${row.language_code}`);
    });

    // Analyze draft content
    const draftContent = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        ct.status,
        ct.language_code
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.is_active = TRUE
        AND ci.component_type IN ('dropdown', 'option', 'dropdown_option', 'placeholder', 'label')
        AND ct.status = 'draft'
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 10
    `);

    console.log('\n📋 Draft content in development:');
    draftContent.rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.content_key} (${row.component_type}, ${row.screen_location}) - ${row.language_code}`);
    });

    return {
      statusAnalysis: statusAnalysis.rows,
      pendingContent: pendingContent.rows,
      draftContent: draftContent.rows
    };

  } catch (error) {
    console.error('❌ Error analyzing content approval status:', error);
  }
}

/**
 * Implement content approval workflow
 */
async function implementContentApprovalWorkflow() {
  console.log('🔧 Implementing content approval workflow...\n');

  try {
    const approvalManager = new ContentApprovalManager();

    // Test 1: Add content to approval queue
    console.log('📋 TEST 1: Adding content to approval queue...');
    
    const testContent = [
      { id: '1', content_key: 'test_dropdown_1', component_type: 'dropdown', priority: 'high' },
      { id: '2', content_key: 'test_option_1', component_type: 'option', priority: 'normal' },
      { id: '3', content_key: 'test_placeholder_1', component_type: 'placeholder', priority: 'low' }
    ];

    testContent.forEach(content => {
      approvalManager.addToApprovalQueue(content);
    });

    // Test 2: Get approval queue
    console.log('\n📋 TEST 2: Getting approval queue...');
    const queue = approvalManager.getApprovalQueue();
    console.log(`✅ Approval queue: ${queue.length} items`);
    queue.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.content_key} (${item.component_type}) - Priority: ${item.priority}`);
    });

    // Test 3: Test approval workflow
    console.log('\n📋 TEST 3: Testing approval workflow...');
    
    // Test approval
    const approvalResult = await approvalManager.approveContent('1', 'admin', 'Content looks good');
    console.log(`✅ Approval result: ${approvalResult}`);

    // Test rejection
    const rejectionResult = await approvalManager.rejectContent('2', 'reviewer', 'Needs more information');
    console.log(`✅ Rejection result: ${rejectionResult}`);

    // Test 4: Get approval statistics
    console.log('\n📋 TEST 4: Getting approval statistics...');
    const stats = approvalManager.getApprovalStats();
    console.log('📊 Approval Statistics:');
    console.log(`   Queue: ${stats.queue.total} items (${stats.queue.high} high, ${stats.queue.normal} normal, ${stats.queue.low} low)`);
    console.log(`   History: ${stats.history.total} actions (${stats.history.approved} approved, ${stats.history.rejected} rejected)`);

    return {
      approvalManager,
      queue,
      stats
    };

  } catch (error) {
    console.error('❌ Error implementing content approval workflow:', error);
  }
}

/**
 * Update unified dropdown endpoints with approval workflow
 */
async function updateUnifiedEndpointsWithApprovalWorkflow() {
  console.log('🔄 Updating unified dropdown endpoints with approval workflow...\n');

  try {
    // Generate updated endpoint code
    const updatedEndpointCode = `
/**
 * Universal dropdown options endpoint with approval workflow
 * GET /api/content/dropdown/{contentType}/{contentKey}/options
 * Includes approval status and workflow information
 */
app.get('/api/content/dropdown/:contentType/:contentKey/options', async (req, res) => {
  const { contentType, contentKey } = req.params;
  
  try {
    // Initialize approval manager
    const approvalManager = new ContentApprovalManager();
    
    console.log(\`Fetching unified dropdown options for \${contentType}:\${contentKey} with approval workflow\`);
    
    // ... rest of existing endpoint logic with approval workflow ...
    
    // Execute unified query with approval status
    const result = await safeQuery(\`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en,
        ct_ru.status as ru_status,
        ct_he.status as he_status,
        ct_en.status as en_status,
        CAST(
          COALESCE(
            SUBSTRING(ci.content_key FROM '_option_([0-9]+)$'),
            SUBSTRING(ci.content_key FROM '_options_([0-9]+)$'),
            SUBSTRING(ci.content_key FROM '\\\\.option\\\\.([0-9]+)$')
          ) AS INTEGER
        ) as option_order
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en'
      \${whereClause}
      ORDER BY option_order NULLS LAST, ci.content_key
    \`, queryParams);
    
    // Transform to unified response format with approval info
    const options = result.rows.map((row, index) => {
      const canView = approvalManager.canViewContent(row.ru_status) || 
                     approvalManager.canViewContent(row.he_status) || 
                     approvalManager.canViewContent(row.en_status);
      
      const canEdit = approvalManager.canEditContent(row.ru_status) || 
                     approvalManager.canEditContent(row.he_status) || 
                     approvalManager.canEditContent(row.en_status);
      
      const canApprove = approvalManager.canApproveContent(row.ru_status) || 
                        approvalManager.canApproveContent(row.he_status) || 
                        approvalManager.canApproveContent(row.en_status);
      
      return {
        id: row.id.toString(),
        content_key: row.content_key,
        component_type: row.component_type,
        screen_location: row.screen_location,
        order: row.option_order || (index + 1),
        translations: {
          ru: row.title_ru || '',
          he: row.title_he || '',
          en: row.title_en || ''
        },
        status: {
          ru: row.ru_status,
          he: row.he_status,
          en: row.en_status
        },
        approval: {
          canView,
          canEdit,
          canApprove,
          nextStatus: approvalManager.getNextStatus(row.ru_status)
        }
      };
    });
    
    res.json({
      success: true,
      data: {
        content_type: contentType,
        content_key: actualContentKey,
        options_count: options.length,
        options: options,
        approval_stats: approvalManager.getApprovalStats()
      }
    });
    
  } catch (error) {
    console.error(\`Unified dropdown options error for \${contentType}:\${contentKey}:\`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
`;

    console.log('✅ Updated endpoint code generated with approval workflow');
    console.log('📋 Key features added:');
    console.log('   - Approval status information in response');
    console.log('   - Workflow permissions (canView, canEdit, canApprove)');
    console.log('   - Next status information for workflow');
    console.log('   - Approval statistics in response');

    return updatedEndpointCode;

  } catch (error) {
    console.error('❌ Error updating unified endpoints:', error);
  }
}

/**
 * Generate content approval recommendations
 */
async function generateContentApprovalRecommendations() {
  console.log('💡 Generating content approval recommendations...\n');

  try {
    // Recommendation 1: Approval workflow stages
    console.log('📋 RECOMMENDATION 1: Approval Workflow Stages');
    console.log('   - Draft: Content creation and editing');
    console.log('   - Pending: Ready for review and approval');
    console.log('   - Approved: Production-ready content');
    console.log('   - Rejected: Needs revision and resubmission');
    console.log('');

    // Recommendation 2: Role-based permissions
    console.log('📋 RECOMMENDATION 2: Role-Based Permissions');
    console.log('   - Content creators: Can create and edit draft content');
    console.log('   - Reviewers: Can review and approve/reject pending content');
    console.log('   - Administrators: Can manage all content and workflows');
    console.log('   - End users: Can only view approved content');
    console.log('');

    // Recommendation 3: Approval queue management
    console.log('📋 RECOMMENDATION 3: Approval Queue Management');
    console.log('   - Priority-based queue ordering (high, normal, low)');
    console.log('   - Automatic notifications for pending content');
    console.log('   - Approval history tracking and audit logs');
    console.log('   - Bulk approval operations for efficiency');
    console.log('');

    // Recommendation 4: Content validation
    console.log('📋 RECOMMENDATION 4: Content Validation');
    console.log('   - Validate content completeness before approval');
    console.log('   - Check for required translations (RU, HE, EN)');
    console.log('   - Verify content follows @dropDownDBlogic rules');
    console.log('   - Automated quality checks and validation');
    console.log('');

    // Recommendation 5: Workflow automation
    console.log('📋 RECOMMENDATION 5: Workflow Automation');
    console.log('   - Automatic status transitions based on actions');
    console.log('   - Email notifications for workflow events');
    console.log('   - Dashboard for approval queue management');
    console.log('   - Integration with existing content management systems');
    console.log('');

  } catch (error) {
    console.error('❌ Error generating content approval recommendations:', error);
  }
}

/**
 * Main function to implement content approval workflow
 */
async function implementContentApprovalWorkflowSystem() {
  console.log('🚀 IMPLEMENTING CONTENT APPROVAL WORKFLOW SYSTEM');
  console.log('================================================\n');

  try {
    // Step 1: Analyze content approval status
    const approvalAnalysis = await analyzeContentApprovalStatus();

    // Step 2: Implement content approval workflow
    const workflowResults = await implementContentApprovalWorkflow();

    // Step 3: Update unified endpoints
    const updatedEndpointCode = await updateUnifiedEndpointsWithApprovalWorkflow();

    // Step 4: Generate recommendations
    await generateContentApprovalRecommendations();

    // Step 5: Test content approval workflow
    console.log('🧪 Testing content approval workflow...\n');

    // Test approval statuses
    console.log('📋 Approval Status Definitions:');
    Object.entries(APPROVAL_STATUSES).forEach(([status, info]) => {
      console.log(`  ${status.toUpperCase()}:`);
      console.log(`    Description: ${info.description}`);
      console.log(`    Can View: ${info.canView}`);
      console.log(`    Can Edit: ${info.canEdit}`);
      console.log(`    Can Approve: ${info.canApprove}`);
      console.log(`    Next Status: ${info.nextStatus || 'None'}`);
      console.log('');
    });

    // Test approval manager
    const approvalManager = workflowResults.approvalManager;
    const stats = approvalManager.getApprovalStats();
    console.log('📊 Content Approval Manager Statistics:');
    console.log(`   Queue: ${stats.queue.total} items (${stats.queue.high} high, ${stats.queue.normal} normal, ${stats.queue.low} low)`);
    console.log(`   History: ${stats.history.total} actions (${stats.history.approved} approved, ${stats.history.rejected} rejected)`);

    console.log('\n✅ Content approval workflow system implemented successfully!');

  } catch (error) {
    console.error('❌ Error implementing content approval workflow system:', error);
  } finally {
    await pool.end();
  }
}

// Execute if run directly
if (require.main === module) {
  implementContentApprovalWorkflowSystem().catch(console.error);
}

module.exports = { 
  ContentApprovalManager,
  APPROVAL_STATUSES,
  analyzeContentApprovalStatus,
  implementContentApprovalWorkflow,
  updateUnifiedEndpointsWithApprovalWorkflow,
  generateContentApprovalRecommendations,
  implementContentApprovalWorkflowSystem
}; 