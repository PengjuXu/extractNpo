#!/usr/bin/env nodejs
//#!/usr/bin/env NODE_PATH="/usr/local/lib/node_modules" nodejs

console.log('Arguments:', process.argv.length);
console.log(process.argv);

//console.log(process.env);

/*
extract pictures from NPO files NPO files created by Windows Phone app Smart Shoot

Needs nodejs to run

Usage: extractNpo.js

outputs: jpg files in the same directory (thumbnail files not output)
The script uses algorithm similar to Knuth–Morris–Pratt algorithm, but not as sophisticated.

Hope this script helps unlock your precious moments!

I am looking for job.
Please help refer.
http://cn.linkedin.com/in/PengjuXu
*/


/*basic NPO file structure:
  file start: ffd8ffe1   not like in jpg spec: Magic number	ff d8 ff         0xFF, 0xD9	End Of Image
  big files (jpg files to be extracted)
    phone: 5 x ~1.3M
    found no difference binarily between the chosen one (the jpg file) and the extracted one (actually many extracted) 
      sometimes there is binary difference (due to phone edit?)
  small files   (same content as big files? looks very much so)
    thumbnails 
    Nokia 520 phone: 5 x ~160K
  */

var fs = require('fs');
var path = require('path');
var os = require('os');

for(var i=2, l=process.argv.length; i<l; i++) {
    var file = process.argv[i];
    if(path.extname(process.argv[i]).toLowerCase()!=='.npo') {
        console.error('File %s is not npo file', process.argv[i]);
    } else {
        var fbuffer = fs.readFileSync(file);
        var bl = fbuffer.length;
        console.log('buffer size:%s', bl);
        //console.log('buffer:%s%s%s', fbuffer[0], fbuffer[1], fbuffer[2]);
        
        var fileNo = 1, fileStart = 0;
        //var cur = 1024;  //end shouldn't be within 1k normally
        
        var cur = Math.floor(bl/12);  //roughly 6 big files, use half average file size should be good 
        var jpgPrefix = path.join(path.dirname(file), path.basename(file, '.NPO') + '_');
        for(; cur < bl && fileNo < 6; ){    //fileNo < 30 as a guard against bug 
            //string pattern matching in buffer, not most efficient, should not start all over with searchedForString  
            if(fbuffer[cur] == 0xff){
                if(fbuffer[cur+1] == 0xd8){
                    if(fbuffer[cur+2] == 0xff){
                        if(fbuffer[cur+3] == 0xe1){
                            var jpgFilePath = jpgPrefix + fileNo +'.jpg'; 
                            fs.writeFileSync(jpgFilePath, fbuffer.slice(fileStart, cur));
                            console.log('wrote file %s', fileNo);
                            fileNo++;
                            var fileSize = cur-fileStart;
                            fileStart = cur;
                            cur+=Math.floor(fileSize*0.8);  //next time take this file size as a hint 
                        } else {
                            cur+=2;
                        }
                    } else {
                        cur+=3;
                    }
                } else {
                    cur+=1;
                }
            } else {
                cur+=1;
            }
        }
        //don't need those small files  (thumbnails)
        //var jpgFilePath = jpgPrefix + fileNo +'.jpg'; 
        //fs.writeFileSync(jpgFilePath, fbuffer.slice(fileStart));
        console.log('extracted %s%% (all needed files should be over 85%%)', Math.floor((100*fileStart)/bl));
        //didn't find a way to discard the buffer, maybe it gets GCed? 
        
    }
    
}
    


