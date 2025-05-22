// Export all report modules
export * from './reportTypes';
export * from './predefinedTemplates';
export * from './templateManager';
export * from './reportGenerator';

/**
 * Report Builder API
 * 
 * This module provides a complete solution for creating, managing, and generating
 * custom reports in the Yathashakti application.
 * 
 * Key features:
 * - Predefined report templates for common use cases
 * - Custom template creation and management
 * - Flexible filtering and sorting options
 * - Multiple export formats (PDF, Excel, CSV)
 * 
 * Usage example:
 * ```typescript
 * import { getAllTemplates, generateReport, ReportFormat } from '@/utils/reports';
 * 
 * // Get all available templates
 * const templates = await getAllTemplates();
 * 
 * // Select a template
 * const template = templates[0];
 * 
 * // Generate a report using the template
 * await generateReport(
 *   {
 *     templateId: template.id,
 *     name: 'My Custom Report',
 *     format: ReportFormat.PDF,
 *     dateRange: {
 *       startDate: new Date('2025-01-01'),
 *       endDate: new Date()
 *     }
 *   },
 *   template,
 *   transactions // Your data source
 * );
 * ```
 */
