var mRuns = 1;
var mUseHighRes = false;
var mTimeSum = 0;
var mTime;
var mConversionTimeSum;
var mConversionTime;

var kFastSha1       = 0;
var kOriginalSha1   = 1;
var kMtSha1         = 2;
var kCryptoJSSha1   = 3;
var kJsSha1         = 4;
var kScjlSha1       = 5;
var kRusha          = 6;

var kTags = ['fast', 'orig', 'mt', 'cryptojs', 'jssha', 'scjl', 'rusha'];

var kFirstType      = kFastSha1;
var kLastType       = kJsSha1;

var kAscii          = 0;
var kKorean         = 1;
var kJapanese       = 2;
var kMixed          = 3;

function startTimer() {
    mTime = mUseHighRes ? performance.now() : Date.now();
}

function endTimer() {
    return (mUseHighRes ? performance.now() - mTime : Date.now() - mTime);
}

function mtSha1Wrapper(input) {
    return Sha1.hash(input, true);
}

function jsSha1Wrapper(input) {
    var shaObj = new jsSHA(input, "TEXT");
    return shaObj.getHash("SHA-1", "HEX");
}

function scjlSha1Wrapper(input) {
    var hashArray = sjcl.hash.sha1.hash(input);
    return toHex(hashArray[0]) + toHex(hashArray[1]) + toHex(hashArray[2]) + toHex(hashArray[3]) + toHex(hashArray[4]);
}

function rushaWrapper(input) {
    var r = new Rusha();
    return r.digest(toUTF8(input));
}

function benchmark(input, type) {
    mTimeSum = 0;
    var tag;

    tag = kTags[type];

    switch (type)
    {
        case kFastSha1:
            fn = FastSHA1;
            break;
        case kOriginalSha1:
            fn = SHA1;
            break;
        case kMtSha1:
            fn = mtSha1Wrapper;
            break;
        case kCryptoJSSha1:
            fn = CryptoJS.SHA1;
            break;
        case kJsSha1:
            fn = jsSha1Wrapper;
            break;
        case kScjlSha1:
            fn = scjlSha1Wrapper;
            break;
        case kRusha:
            fn = rushaWrapper;
            break;
        default:
            alert('ASSERT: Function should not reach here.');
            return;
    }

    for (var i = 0; i < mRuns; i++) {
        startTimer();
        var out = fn(input);
        mTimeSum += endTimer();
    }

    document.getElementById('log_' + tag).textContent = mTimeSum / mRuns;
    document.getElementById('out_' + tag).textContent = out;
}

function updateRunCount(count) {
    mRuns = document.getElementById('runcount_label').textContent = count;
    return count;
}

function generateTestData(type) {
    var string;

    switch (type)
    {
        case kAscii:
            string = 'The quick brown fox jumped over the lazy dogs. ';
            break;
        case kKorean:
            string = '빠른 여우가 게으른 개들 위를 뛰어 넘었다. ';
            break;
        // FIXME: This is nonsense from Google Translate.
        case kJapanese:
            string = '速いキツネが怠惰な犬の上を越えた。 '
            break;
        case kMixed:
            string = 'The はやい brown フォックス 점프 over the lazy 犬. ';
            break;
        default:
            alert('ASSERT: Function should not reach here.');
            return;
    }

    var buf = '';

    for (var i = 0; i <= 4096; i++)
    {
        buf += string;
    }

    document.getElementById('in').value = buf;
}

function toHex(val) {
    var str = "";
    var i;
    var v;

    for (i = 7; i >= 0; i--) {
        v = (val >>> (i * 4)) & 0x0f;
        str += v.toString(16);
    }
    return str;
};

// Rusha does not have a UTF8 converter, so copying it from fastsha.js
function toUTF8(string) {
    var utftext = "";

    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if (c > 2047) {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
    }
    return utftext;
};

document.addEventListener('DOMContentLoaded', function(e) {
    mUseHighRes = typeof window.performance === 'undefined' ? false : true;
    generateTestData(kMixed);
    updateRunCount(document.getElementById('runcount').value);
}, false);
