/**
 * A trimmed but shape-accurate sample of the Behold JSON feed, used by the
 * parser tests. Typed as `unknown` so tests exercise the same untrusted path
 * the real payload takes. URLs are shortened; structure mirrors production.
 */
export const beholdFeedFixture: unknown = {
	biography: '🎧 DJ | Producer | Vocalist',
	profilePictureUrl: 'https://cdn2.behold.pictures/abc/profile.webp',
	website: 'https://on.soundcloud.com/example',
	followersCount: 3067,
	followsCount: 3511,
	posts: [
		{
			id: '18109217260910500',
			timestamp: '2026-05-29T18:49:02+0000',
			permalink: 'https://www.instagram.com/reel/DY7uK1Rk6BU/',
			mediaType: 'VIDEO',
			isReel: true,
			mediaUrl: 'https://scontent.cdninstagram.com/o1/v/t2/video-1.mp4?oe=6A1CD98F',
			thumbnailUrl: 'https://scontent.cdninstagram.com/v/t51/thumb-1.jpg?oe=6A20CF0B',
			sizes: {
				small: {
					height: null,
					width: null,
					mediaUrl: 'https://scontent.cdninstagram.com/small-1.jpg'
				},
				medium: {
					height: null,
					width: null,
					mediaUrl: 'https://scontent.cdninstagram.com/medium-1.jpg'
				},
				large: {
					height: null,
					width: null,
					mediaUrl: 'https://scontent.cdninstagram.com/large-1.jpg'
				},
				full: {
					height: null,
					width: null,
					mediaUrl: 'https://scontent.cdninstagram.com/full-1.jpg'
				}
			},
			caption: 'like hello??? #ameliaearhart #midwestgirl #baddie #midwest',
			prunedCaption: 'like hello???',
			hashtags: ['ameliaearhart', 'midwestgirl', 'baddie', 'midwest'],
			mentions: [],
			colorPalette: null
		},
		{
			id: '17975086685877478',
			timestamp: '2026-05-26T14:05:05+0000',
			permalink: 'https://www.instagram.com/reel/DYzfNKUDSIr/',
			mediaType: 'VIDEO',
			isReel: true,
			mediaUrl: 'https://scontent.cdninstagram.com/o1/v/t2/video-2.mp4',
			thumbnailUrl: 'https://scontent.cdninstagram.com/v/t51/thumb-2.jpg',
			sizes: {
				small: { height: null, width: null, mediaUrl: null },
				medium: { height: null, width: null, mediaUrl: null },
				large: { height: null, width: null, mediaUrl: null },
				full: { height: null, width: null, mediaUrl: null }
			},
			caption: 'No weekend @frankyandlouies is the same #party #bass',
			prunedCaption: 'No weekend @frankyandlouies is the same',
			hashtags: ['party', 'bass'],
			mentions: ['frankyandlouies'],
			colorPalette: null
		}
	]
};
