import { Octokit } from 'octokit';
import { Endpoints } from '@octokit/types';

const THREE_WEEKS_AGO = new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000);

type Repository = Endpoints["GET /orgs/{org}/repos"]["response"]["data"][number];
type PullRequest = Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"]["data"][number];

interface RatingCriteria {
    description: { score: number; maxScore: number };
    readme: { score: number; maxScore: number };
    staleBranches: { score: number; maxScore: number; count: number };
    oldPullRequests: { score: number; maxScore: number; count: number };
}

export interface RatedRepository extends Repository {
    rating: number;
    ratingDetails: RatingCriteria;
}

async function rateDescription(repo: Repository): Promise<number> {
    return repo.description ? 1 : 0;
}

async function rateReadme(octokit: Octokit, repo: Repository): Promise<number> {
    try {
        const { data: readme } = await octokit.rest.repos.getReadme({
            owner: repo.owner.login,
            repo: repo.name,
        });
        const content = Buffer.from(readme.content, 'base64').toString();
        const lineCount = content.split('\n').length;
        return lineCount > 100 ? 3 : 1;
    } catch (error) {
        return 0; // No README
    }
}

async function rateStaleBranches(octokit: Octokit, repo: Repository): Promise<{ score: number; count: number }> {
    try {
        const { data: branches } = await octokit.rest.repos.listBranches({
            owner: repo.owner.login,
            repo: repo.name,
        });

        const { data: defaultBranch } = await octokit.rest.repos.getBranch({
            owner: repo.owner.login,
            repo: repo.name,
            branch: repo.default_branch,
        });

        let staleCount = 0;
        for (const branch of branches) {
            if (branch.name === repo.default_branch) continue;

            const { data: compare } = await octokit.rest.repos.compareCommits({
                owner: repo.owner.login,
                repo: repo.name,
                base: defaultBranch.commit.sha,
                head: branch.commit.sha,
            });

            if (compare.behind_by === 0 && compare.ahead_by === 0) {
                staleCount++;
            }
        }
        return { score: staleCount > 5 ? 0 : 3, count: staleCount };
    } catch (error) {
        return { score: 0, count: 0 };
    }
}

async function rateOldPullRequests(octokit: Octokit, repo: Repository): Promise<{ score: number; count: number }> {
    try {
        const { data: prs } = await octokit.rest.pulls.list({
            owner: repo.owner.login,
            repo: repo.name,
            state: 'open',
        });

        const oldPrs = prs.filter((pr: PullRequest) => new Date(pr.created_at) < THREE_WEEKS_AGO);
        return { score: oldPrs.length > 10 ? 0 : 3, count: oldPrs.length };
    } catch (error) {
        return { score: 0, count: 0 };
    }
}

async function rateRepository(octokit: Octokit, repo: Repository): Promise<RatedRepository> {
    const descriptionScore = await rateDescription(repo);
    const readmeScore = await rateReadme(octokit, repo);
    const { score: staleBranchesScore, count: staleBranchesCount } = await rateStaleBranches(octokit, repo);
    const { score: oldPullRequestsScore, count: oldPullRequestsCount } = await rateOldPullRequests(octokit, repo);

    const ratingDetails: RatingCriteria = {
        description: { score: descriptionScore, maxScore: 1 },
        readme: { score: readmeScore, maxScore: 3 },
        staleBranches: { score: staleBranchesScore, maxScore: 3, count: staleBranchesCount },
        oldPullRequests: { score: oldPullRequestsScore, maxScore: 3, count: oldPullRequestsCount },
    };

    const totalScore = descriptionScore + readmeScore + staleBranchesScore + oldPullRequestsScore;
    const maxScore = 1 + 3 + 3 + 3;
    const rating = (totalScore / maxScore) * 10;

    return { ...repo, rating: Math.round(rating), ratingDetails };
}

export async function getRatedRepositories(org: string, token: string, page: number = 1): Promise<RatedRepository[]> {
    const octokit = new Octokit({ auth: token });

    try {
        const { data: repos } = await octokit.rest.repos.listForOrg({
            org,
            type: 'all',
            per_page: 10,
            page,
        });

        const ratedRepos = await Promise.all(
            repos.map((repo: Repository) => rateRepository(octokit, repo))
        );

        return ratedRepos;
    } catch (error) {
        console.error('Error fetching repositories:', error);
        throw error;
    }
}
