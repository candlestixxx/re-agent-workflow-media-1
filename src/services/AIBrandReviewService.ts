import { ListingMediaJob } from '../models/ListingMediaJob';
import { GeneratedAsset } from '../models/GeneratedAsset';
import { SocialPostDraft } from '../models/SocialPostDraft';
import { ComplianceLog } from '../models/ComplianceLog';
import { AlertingService } from './AlertingService';

export interface ReviewResult {
  passed: boolean;
  score: number;
  checks: ComplianceCheck[];
  reviewer: string;
  comments: string;
}

export interface ComplianceCheck {
  rule: string;
  passed: boolean;
  severity: 'blocker' | 'warning' | 'info';
  message: string;
}

const FAIR_HOUSING_BANNED = [
  'no kids', 'no children', 'adults only', 'no section 8', 'no vouchers',
  'christian', 'catholic', 'jewish', 'muslim', 'white', 'black neighborhood',
  'safe neighborhood', 'good schools', 'family friendly', 'bachelor',
  'perfect for couples', 'ideal for singles', 'no students', 'working professionals only'
];

const MISLEADING_PATTERNS = [
  'guaranteed', 'no money down', 'risk free', 'act now', 'limited time',
  'once in a lifetime', 'must sell', 'priced to sell', 'won\'t last',
  'motivated seller', 'divorce sale', 'foreclosure deal', 'steal', 'fire sale'
];

const FTC_REQUIRED_DISCLOSURES = [
  'equal housing opportunity', 'eho', 'realtor', 'brokerage'
];

export class AIBrandReviewService {
  private static readonly REVIEWER_ID = 'ai-compliance-engine-v2';

  public static async reviewJob(
    job: ListingMediaJob,
    assets: GeneratedAsset[],
    socialPosts: SocialPostDraft[] = []
  ): Promise<ReviewResult> {
    const checks: ComplianceCheck[] = [];

    checks.push(...this.checkFairHousing(job, socialPosts));
    checks.push(...this.checkMisleadingClaims(socialPosts));
    checks.push(...this.checkFTCCompliance(job, socialPosts));
    checks.push(...this.checkAssetCompleteness(job, assets));
    checks.push(...this.checkImageQuality(assets));
    checks.push(...this.checkBrandConsistency(job, assets, socialPosts));

    const blockers = checks.filter(c => !c.passed && c.severity === 'blocker');
    const warnings = checks.filter(c => !c.passed && c.severity === 'warning');
    const passedChecks = checks.filter(c => c.passed);
    const score = Math.round((passedChecks.length / Math.max(checks.length, 1)) * 100);

    const passed = blockers.length === 0 && score >= 70;
    const comments = blockers.length > 0
      ? 'Blocked: ' + blockers.map(b => b.message).join('; ')
      : warnings.length > 0
        ? 'Passed with ' + warnings.length + ' warning(s). Score: ' + score + '%'
        : 'All checks passed. Score: ' + score + '%';

    return { passed, score, checks, reviewer: this.REVIEWER_ID, comments };
  }

  public static async reviewSocialPost(
    post: SocialPostDraft,
    job: ListingMediaJob
  ): Promise<ReviewResult> {
    const checks: ComplianceCheck[] = [];
    checks.push(...this.checkFairHousing(job, [post]));
    checks.push(...this.checkMisleadingClaims([post]));
    checks.push(...this.checkFTCCompliance(job, [post]));
    checks.push(...this.checkCaptionLength(post));
    checks.push(...this.checkHashtags(post));

    const blockers = checks.filter(c => !c.passed && c.severity === 'blocker');
    const passedChecks = checks.filter(c => c.passed);
    const score = Math.round((passedChecks.length / Math.max(checks.length, 1)) * 100);
    const passed = blockers.length === 0 && score >= 60;

    return {
      passed,
      score,
      checks,
      reviewer: this.REVIEWER_ID,
      comments: passed ? 'Post approved (' + score + '%)' : 'Post rejected: ' + blockers.map(b => b.message).join('; ')
    };
  }

  private static checkFairHousing(job: ListingMediaJob, posts: SocialPostDraft[]): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const allText = [
      job.propertyAddress,
      ...posts.map(p => p.caption)
    ].join(' ').toLowerCase();

    for (const phrase of FAIR_HOUSING_BANNED) {
      if (allText.includes(phrase)) {
        checks.push({
          rule: 'fair-housing',
          passed: false,
          severity: 'blocker',
          message: 'Fair Housing violation detected: "' + phrase + '" is potentially discriminatory'
        });
      }
    }

    if (checks.length === 0) {
      checks.push({
        rule: 'fair-housing',
        passed: true,
        severity: 'blocker',
        message: 'No fair housing violations detected'
      });
    }

    return checks;
  }

  private static checkMisleadingClaims(posts: SocialPostDraft[]): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const allText = posts.map(p => p.caption).join(' ').toLowerCase();

    for (const pattern of MISLEADING_PATTERNS) {
      if (allText.includes(pattern)) {
        checks.push({
          rule: 'misleading-claims',
          passed: false,
          severity: 'blocker',
          message: 'Potentially misleading claim: "' + pattern + '"'
        });
      }
    }

    if (checks.length === 0) {
      checks.push({
        rule: 'misleading-claims',
        passed: true,
        severity: 'blocker',
        message: 'No misleading claims detected'
      });
    }

    return checks;
  }

  private static checkFTCCompliance(job: ListingMediaJob, posts: SocialPostDraft[]): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const allText = posts.map(p => p.caption).join(' ').toLowerCase();

    const hasDisclosure = FTC_REQUIRED_DISCLOSURES.some(d => allText.includes(d));

    if (posts.length > 0 && !hasDisclosure) {
      checks.push({
        rule: 'ftc-disclosure',
        passed: false,
        severity: 'warning',
        message: 'Missing FTC/Equal Housing disclosure in social post captions'
      });
    } else {
      checks.push({
        rule: 'ftc-disclosure',
        passed: true,
        severity: 'warning',
        message: 'FTC disclosures present or not applicable'
      });
    }

    return checks;
  }

  private static checkAssetCompleteness(job: ListingMediaJob, assets: GeneratedAsset[]): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];

    const hasDayImage = assets.some(a => a.type === 'day');
    const hasSocialGraphic = assets.some(a => a.type === 'social_graphic');

    if (!hasDayImage) {
      checks.push({
        rule: 'asset-completeness',
        passed: false,
        severity: 'warning',
        message: 'No day image generated for listing'
      });
    } else {
      checks.push({
        rule: 'asset-completeness',
        passed: true,
        severity: 'warning',
        message: 'Day image present'
      });
    }

    if (job.stage === 'Just Listed' && !hasSocialGraphic) {
      checks.push({
        rule: 'asset-completeness',
        passed: false,
        severity: 'warning',
        message: 'Just Listed stage requires a social graphic asset'
      });
    }

    return checks;
  }

  private static checkImageQuality(assets: GeneratedAsset[]): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];

    if (assets.length === 0) {
      return [{
        rule: 'image-quality',
        passed: false,
        severity: 'info',
        message: 'No assets to evaluate for quality'
      }];
    }

    for (const asset of assets) {
      if (asset.versionNumber > 3) {
        checks.push({
          rule: 'image-quality',
          passed: false,
          severity: 'warning',
          message: 'Asset ' + asset.id + ' has ' + asset.versionNumber + ' revisions — review quality concerns'
        });
      }
    }

    if (checks.length === 0) {
      checks.push({
        rule: 'image-quality',
        passed: true,
        severity: 'info',
        message: 'Image quality checks passed (' + assets.length + ' assets)'
      });
    }

    return checks;
  }

  private static checkBrandConsistency(
    job: ListingMediaJob,
    assets: GeneratedAsset[],
    posts: SocialPostDraft[]
  ): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];

    for (const post of posts) {
      const caption = post.caption;
      if (caption.length > 0 && caption === caption.toUpperCase()) {
        checks.push({
          rule: 'brand-consistency',
          passed: false,
          severity: 'warning',
          message: 'Post ' + post.id + ' is all caps — violates brand voice guidelines'
        });
      }
      if (caption.includes('!!!') || caption.includes('...')) {
        checks.push({
          rule: 'brand-consistency',
          passed: false,
          severity: 'info',
          message: 'Post ' + post.id + ' uses informal punctuation'
        });
      }
    }

    if (checks.length === 0) {
      checks.push({
        rule: 'brand-consistency',
        passed: true,
        severity: 'info',
        message: 'Brand consistency verified'
      });
    }

    return checks;
  }

  private static checkCaptionLength(post: SocialPostDraft): ComplianceCheck[] {
    const len = post.caption.length;
    const limits: Record<string, number> = {
      'Facebook': 63206,
      'Instagram': 2200,
      'LinkedIn': 3000,
      'X': 280
    };
    const limit = limits[post.platform] || 2200;

    if (len > limit) {
      return [{
        rule: 'caption-length',
        passed: false,
        severity: 'blocker',
        message: 'Caption exceeds ' + post.platform + ' limit (' + len + '/' + limit + ')'
      }];
    }

    return [{
      rule: 'caption-length',
      passed: true,
      severity: 'blocker',
      message: 'Caption length OK (' + len + '/' + limit + ')'
    }];
  }

  private static checkHashtags(post: SocialPostDraft): ComplianceCheck[] {
    const hashtagCount = (post.caption.match(/#\w+/g) || []).length;

    if (hashtagCount > 30) {
      return [{
        rule: 'hashtag-count',
        passed: false,
        severity: 'warning',
        message: 'Excessive hashtags (' + hashtagCount + ') — platform may flag as spam'
      }];
    }

    return [{
      rule: 'hashtag-count',
      passed: true,
      severity: 'info',
      message: 'Hashtag count OK (' + hashtagCount + ')'
    }];
  }

  public static async logCompliance(
    targetId: string,
    targetType: 'Asset' | 'SocialPost' | 'LandingPage',
    result: ReviewResult
  ): Promise<void> {
    for (const check of result.checks) {
      const log: ComplianceLog = {
        id: 'cl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        targetId,
        targetType,
        ruleChecked: check.rule,
        passed: check.passed,
        reviewer: result.reviewer,
        comments: check.message,
        timestamp: new Date()
      };
      console.log('[ComplianceLog]', JSON.stringify(log));
    }

    if (!result.passed) {
      await AlertingService.sendAlert(
        'Compliance review FAILED for ' + targetType + ' ' + targetId + ': ' + result.comments,
        'warning'
      );
    }
  }
}
