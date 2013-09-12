var youtubeChannelName = "StackedVRanch";
var youtubeDefaultVideoID = "oajANAxHEsI";
var videoDataArray = new Array();
var divContent = "";
jQuery.support.cors = true;
function buildVideoArray(startIndex) {
var youtube_api_url = "http://gdata.youtube.com/feeds/api/videos?max-results=50&alt=json&orderby=published&start-index=" + startIndex + "&author=" + youtubeChannelName;
$.ajax({
type: "GET",
url: youtube_api_url,
cache: false,
data: "{}",
dataType: "jsonp",
error: function(xhr, status, errorThrown) {
//console.log(xhr + ', ' + status + ', ' + errorThrown);
},
success: function(response) {
var output = response.feed.entry;
var iVal = startIndex - 1;
// Log how many videos are found
var videoCount = output.length;
//console.log('Video Count: ' + videoCount + ', iVal: ' + iVal);
for (var i = 0, iValNum = iVal; videoCount > i; i++, iValNum++) {
// 0 = Youtube ID
// 1 = Publish Date
// 2 = Title
// 3 = Description
// 4 = Thumbnail Image
// 5 = Rating
// 6 = Views
// 7 = Runtime Str
videoDataArray[iValNum] = new Array();
videoDataArray[iValNum][0] = output[i].id.$t.replace(/.*api\/videos\//,'');
videoDataArray[iValNum][1] = output[i].published.$t.substr(0,10);
videoDataArray[iValNum][2] = output[i].title.$t;
videoDataArray[iValNum][3] = output[i].content.$t;
videoDataArray[iValNum][4] = output[i].media$group.media$thumbnail[3].url;
if (output[i].gd$rating) { videoDataArray[iValNum][5] = Math.round( output[i].gd$rating.average * 10 ) / 10; } // Round to 10ths place
else { videoDataArray[iValNum][5] = 0; }
if (output[i].yt$statistics) { videoDataArray[iValNum][6] = output[i].yt$statistics.viewCount; }
else { videoDataArray[iValNum][6] = 0; }
// Video Runtime (convert seconds to mm:ss)
var video_runtime_str = "";
var video_runtime_sec = output[i].media$group.yt$duration.seconds;
var video_runtime_min = 0;
while (video_runtime_sec >= 60) { video_runtime_sec -= 60; video_runtime_min++; }
if (video_runtime_sec < 10) { video_runtime_sec = "0" + video_runtime_sec; }
videoDataArray[iValNum][7] = '<span class="video_runtime">(' + video_runtime_min + ':' + video_runtime_sec + ')</span>';
// Video Description
// -- remove links
videoDataArray[iValNum][3] = videoDataArray[iValNum][3].replace(/www..*?.com/g, '');
videoDataArray[iValNum][3] = videoDataArray[iValNum][3].replace(' ', ' ');
//videoDataArray[iValNum][3] = videoDataArray[iValNum][3].replace(/http..*$/, '');
if (videoDataArray[iValNum][3].length > 270) {
videoDataArray[iValNum][3] = videoDataArray[iValNum][3].substr(0,270) + '... <a href="http://www.youtube.com/watch?v=' + videoDataArray[iValNum][0] + '" target="_blank" class="video_full_readmore">read more</a>';
}
// Populate video_container div
divContent += '<div class="video_container"><div class="video_scroll_thumb"><img src="' + videoDataArray[iValNum][4] + '"></div><div class="video_scroll_info">' + videoDataArray[iValNum][2] + ' ' + videoDataArray[iValNum][7] + '</div></div>';
}
if (videoCount == 50) {
buildVideoArray(startIndex + 50);
} else {
renderVideoArray();
//console.log('Final Video Count: ' + videoDataArray.length);
}
}
});
}
buildVideoArray(1);
function renderVideoArray() {
// Populate video list
$('#video_list_inner').html(divContent);
// Render custom scrollbar
initializeScollbar();
// Populate default video
var url_hash = location.hash.replace('#','');
var autoplay_enabled = false;
// To autoplay a video add "-autoplay" after the Youtube Video ID hash name (ie. /video-channel#4Bp42q3rlO0-autoplay)
if (url_hash.search(/-autoplay$/) > -1) {
url_hash = url_hash.replace('-autoplay','');
autoplay_enabled = true;
}
// Default video to load if Video ID is not provided
var videoLoadID = 0;
// If Youtube ID is specified after the hash, search for it
if (url_hash.length > 0) {
videoLoadID = findVideoID(url_hash);
} else if (youtubeDefaultVideoID.length > 0) {
videoLoadID = findVideoID(youtubeDefaultVideoID);
}
// Load the video (default video is most recent added if no specified video is found)
loadVideo(videoLoadID, autoplay_enabled);
}
// Video List Click (load in main window)
$('.video_container').live('click',function() {
var videoNum = $('.video_container').index($(this));
loadVideo(videoNum, false);
});
// Video Loader Function
function loadVideo(videoID, autoPlay) {
// Determine star rating width (70px = 100%)
var starRatingWidth = getStarRatingWidth(videoDataArray[videoID][5]) + "px";
// Autoplay enabled?
var autoplay_str = "";
if (autoPlay == true) { autoplay_str = "&autoplay=1"; }
// Render video and data
$('#video_full_active').html('<iframe width="588" height="360" src="http://www.youtube.com/embed/' + videoDataArray[videoID][0] + '?wmode=transparent' + autoplay_str + '" frameborder="0" allowfullscreen></iframe>');
$('#video_full_stars_red').css('width',starRatingWidth);
$('#video_full_views').html('Views: ' + videoDataArray[videoID][6]);
$('#video_full_title').html(videoDataArray[videoID][2]);
$('#video_full_desc').html(videoDataArray[videoID][3]);
// Highlight active video
$('.video_container').removeClass('video_container_active');
$('.video_container').eq(videoID).addClass('video_container_active');
}
function findVideoID(youtubeID) {
var videoLoadID = 0;
for (var n = 0; videoDataArray.length > n; n++) {
if (videoDataArray[n][0] == youtubeID) {
videoLoadID = n;
break;
}
}
return videoLoadID;
}
function getStarRatingWidth(ratingVal) {
return (Math.round((ratingVal / 5) * 70));
}
