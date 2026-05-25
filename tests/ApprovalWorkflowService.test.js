"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ApprovalWorkflowService_1 = require("../src/services/ApprovalWorkflowService");
describe('ApprovalWorkflowService', () => {
    let baseJob;
    beforeEach(() => {
        baseJob = {
            id: 'job-1',
            propertyAddress: '123 Test St',
            stage: 'Just Listed',
            sourceFolderPath: '/mock',
            status: 'Draft',
            createdBy: 'agent-1',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    });
    describe('submitForApproval', () => {
        it('should transition a Draft job to Pending_Approval', () => {
            const updated = ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval(baseJob);
            expect(updated.status).toBe('Pending_Approval');
        });
        it('should throw an error if job is already Approved', () => {
            baseJob.status = 'Approved';
            expect(() => ApprovalWorkflowService_1.ApprovalWorkflowService.submitForApproval(baseJob)).toThrow('Cannot submit job for approval from status: Approved');
        });
    });
    describe('approveJob', () => {
        it('should transition a Pending_Approval job to Approved and record reviewer', () => {
            baseJob.status = 'Pending_Approval';
            const updated = ApprovalWorkflowService_1.ApprovalWorkflowService.approveJob(baseJob, 'broker-1');
            expect(updated.status).toBe('Approved');
            expect(updated.approvedBy).toBe('broker-1');
        });
        it('should throw an error if the job is not in Pending_Approval status', () => {
            expect(() => ApprovalWorkflowService_1.ApprovalWorkflowService.approveJob(baseJob, 'broker-1')).toThrow("Only jobs in 'Pending_Approval' can be approved");
        });
    });
    describe('publishJob', () => {
        it('should transition an Approved job to Published', () => {
            baseJob.status = 'Approved';
            baseJob.approvedBy = 'broker-1';
            const updated = ApprovalWorkflowService_1.ApprovalWorkflowService.publishJob(baseJob);
            expect(updated.status).toBe('Published');
        });
        it('should throw an error if trying to publish a Draft job', () => {
            expect(() => ApprovalWorkflowService_1.ApprovalWorkflowService.publishJob(baseJob)).toThrow("A job must be 'Approved' before it can be published");
        });
        it('should throw an error if job is Approved but lacks an approvedBy record', () => {
            baseJob.status = 'Approved';
            delete baseJob.approvedBy;
            expect(() => ApprovalWorkflowService_1.ApprovalWorkflowService.publishJob(baseJob)).toThrow('A job cannot be published without a recorded approver');
        });
    });
});
//# sourceMappingURL=ApprovalWorkflowService.test.js.map