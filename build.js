const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'laws');
const files=fs.readdirSync(dir).filter(f=>f.toLowerCase().endsWith('.xml')).sort();
function text(xml,tag){const m=xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`,'i'));return m?m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim():''}
const out=files.map(file=>{const xml=fs.readFileSync(path.join(dir,file),'utf8');const title=text(xml,'Title')||text(xml,'LawTitle')||path.basename(file,'.xml');const type=text(xml,'Type')||'法令';const summary=text(xml,'Summary')||'';const searchText=xml.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();return {id:path.basename(file,'.xml'),file,title,type,summary,searchText}});
fs.writeFileSync(path.join(dir,'index.json'),JSON.stringify(out,null,2)+'\n','utf8');console.log(`e-Laws: ${out.length} law(s) indexed.`);
