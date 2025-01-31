import type { AppBskyActorProfile } from "@atproto/api";
import type { Record } from '@atproto/api/dist/client/types/com/atproto/repo/listRecords';
import type { NodeSavedSession } from "@atproto/oauth-client-node";
import type { IronSession } from "iron-session";

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

		// My-App
		export interface ResultAnalyze {
			activity: {
				all: {
					averageInterval: number|null;
					actionHeatmap: number[]|null;
					lastAt: string|null;
				};
				post: {
					averageInterval: number|null;
					averageLength: number|null;
					wordFreqMap: wordFreq[]|null;
					actionHeatmap: number[]|null;
					sentimentHeatmap: number[]|null;
					lastAt: string|null;
					reply: {
						averageInterval: number|null|undefined;
						actionHeatmap: number[]|null|undefined;
						lastAt: string|null|undefined;
					}
				};
				like: {
					averageInterval: number|null;
					actionHeatmap: number[]|null;
					lastAt: string|null;
				};
				repost: {
					averageInterval: number|null;
					actionHeatmap: number[]|null;
					lastAt: string|null;
				};
			};
			relationship: RecentFriend[]|null;
			updatedAt: string;
			handle?: string;
		}
		
		export interface WordFreq {
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
			resultAnalyze?: ResultAnalyze|null;
		};
		
		export interface ResultAnalyzeDB {
			// all
			averageInterval: number|null;
			activeHistgram: number[]|null;
			lastActionTime: string|null;
			// post
			averagePostsInterval: number|null;
			averageTextLength: number|null;
			wordFreqMap: App.WordFreq[]|null;
			postHistgram: number[]|null;
			sentimentHeatmap: number[]|null;
			lastPostTime: string|null;
			// reply
			averageReplyInterval: number|null;
			replyHistgram: number[]|null;
			lastReplyTime: string|null;
			// like
			averageLikeInterval?: number|null;
			likeHistgram: number[]|null;
			lastLikeTime: string|null;
			// repost
			averageRepostInterval?: number|null;
			repostHistgram: number[]|null;
			lastRepostTime?: string|null;
			// relationship
			recentFriends: RecentFriend[]|null;
		}

		export interface Percentiles {
			averageInterval: number;
			averagePostsInterval: number;
			averageTextLength: number;
			averageLikeInterval: number;
			averageRepostInterval: number;
			averageReplyInterval: number;
		}

		export type CardType = "interval" | "length" | "date";

		interface Locals {
			userLocale: string;
			session: NodeSavedSession | null;
			did: string | null;
		}

		export interface Summary {
			influencer: number;
			morningPerson: number;
			positivity: number;
			postingFreq: number;
			likingFreq: number;
			repostFreq: number;
			longpostFreq: number;
			replyFreq: number;
		};

		export interface IronSessionBsky extends IronSession {
			did: string;
			save: () => Promise<void>;
			destroy: () => void;
		};

		export interface ConfigInvisible {
			allHeatmap: boolean;
			friendsHeatmap: boolean;
		}
	}
}
