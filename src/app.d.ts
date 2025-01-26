import type { AppBskyActorProfile } from "@atproto/api";
import type { Record } from '@atproto/api/dist/client/types/com/atproto/repo/listRecords';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// AT-proto
		export interface RecordExt extends Record {
			value: RecordValue;
		}
		
		interface RecordValue {
      langs?: string[];
			$type: string,
			createdAt: string,
			text?: string,
			reply?: { parent: { uri: string } },
			subject?: { 
				cid: string,
				uri: string,
			},
		}

		interface ProfileExt extends AppBskyActorProfile.Record {
			followsCount?: number;
			followersCount?: number;
		}

		// My-App
		export interface ResultAnalyze {
			activity: {
				all: {
					averageInterval: number|null;
					actionHeatmap: number[];
					lastAt: string|null;
				};
				post: {
					averageInterval: number|null;
					averageLength: number|null;
					wordFreqMap: wordFreq[]|null;
					actionHeatmap: number[];
					sentimentHeatmap: number[];
					lastAt: string|null;
				};
				like: {
					averageInterval: number|null;
					actionHeatmap: number[];
					lastAt: string|null;
				};
				repost: {
					averageInterval: number|null;
					actionHeatmap: number[];
					lastAt: string|null;
				};
			};
			relationship: RecentFriend[];
			updatedAt: string;
		}
		
		export interface wordFreq {
			noun: string;
			count: number;
			sentimentScoreSum: number;
		};
		
		export interface RecentFriend {
			did: string;
			handle?: string;
			displayName?: string;
			avator?: string;
			score: number;
			replyCount?: number;
			likeCount?: number;
		};
		
		export interface ResultAnalyzeDB {
			// all
			averageInterval: number;
			activeHistgram: number[];
			lastActionTime: string;
			// post
			averagePostsInterval: number;
			averageTextLength: number;
			wordFreqMap: number[];
			postHistgram?: number[];
			sentimentHeatmap: number[];
			lastPostTime?: string[];
			// like
			averageLikeInterval?: number;
			lastLikeTime?: string[];
			// repost
			averageRepostInterval?: number;
			lastRepostTime?: string[];
			// relationship
			recentFriends: RecentFriend[];
		}

		export interface Percentiles {
			averageInterval: number;
			averagePostsInterval: number;
			averageTextLength: number;
			averageLikeInterval?: number;
			averageRepostInterval?: number;
		}

		export type CardType = "interval" | "length" | "date";

		interface Locals {
			userLocale: string;
		}
	}
}
