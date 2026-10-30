/** Pumpkin teacher gallery — deploy as a separate Apps Script Web App.
 * Script properties: TEACHER_PASSWORD (strong password).
 * Deploy: Execute as Me; access Anyone (students need to read gallery).
 * Never put the password or a GitHub token in the website source.
 */
const GALLERY_FOLDER_NAME='Mr Scotts Pumpkin Decorations';
const MAX_IMAGES=60;
function galleryFolder_(){const props=PropertiesService.getScriptProperties();let id=props.getProperty('GALLERY_FOLDER_ID');if(id){try{return DriveApp.getFolderById(id)}catch(e){}}const folder=DriveApp.createFolder(GALLERY_FOLDER_NAME);props.setProperty('GALLERY_FOLDER_ID',folder.getId());return folder}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}
function doGet(e){try{const a=e&&e.parameter&&e.parameter.action;if(a==='list')return json_({ok:true,items:list_()});return json_({ok:false,error:'Unknown action'})}catch(err){return json_({ok:false,error:String(err.message||err)})}}
function doPost(e){try{const p=JSON.parse(e.postData.contents||'{}');if(p.action==='login'){const expected=PropertiesService.getScriptProperties().getProperty('TEACHER_PASSWORD');if(!expected||p.password!==expected)throw Error('Incorrect password');const token=Utilities.getUuid()+Utilities.getUuid();CacheService.getScriptCache().put('pumpkin_'+token,'yes',3600);return json_({ok:true,token})}
if(!p.token||CacheService.getScriptCache().get('pumpkin_'+p.token)!=='yes')throw Error('Teacher sign-in required');
if(p.action==='upload'){const match=/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(p.dataUrl||'');if(!match)throw Error('Only PNG, JPG and WebP are supported');const bytes=Utilities.base64Decode(match[2]);if(bytes.length>1500000)throw Error('Image too large');const folder=galleryFolder_();if(list_().length>=MAX_IMAGES)throw Error('Gallery limit reached');const safeName=String(p.name||'Decoration').replace(/[^a-zA-Z0-9 ._-]/g,'').slice(0,70)||'Decoration';const file=folder.createFile(Utilities.newBlob(bytes,match[1],safeName));return json_({ok:true,id:file.getId()})}
if(p.action==='delete'){const folder=galleryFolder_(),file=DriveApp.getFileById(String(p.id||''));if(!folder.getFilesByName(file.getName()).hasNext())throw Error('File not in gallery');const parents=file.getParents();let belongs=false;while(parents.hasNext())if(parents.next().getId()===folder.getId())belongs=true;if(!belongs)throw Error('File not in gallery');file.setTrashed(true);return json_({ok:true})}
throw Error('Unknown action')}catch(err){return json_({ok:false,error:String(err.message||err)})}}
function list_(){const folder=galleryFolder_(),it=folder.getFiles(),out=[];while(it.hasNext()){const f=it.next();if(f.isTrashed())continue;const mime=f.getMimeType();if(!/^image\/(png|jpeg|webp)$/.test(mime))continue;const bytes=f.getBlob().getBytes();if(bytes.length>1500000)continue;out.push({id:f.getId(),name:f.getName(),url:'data:'+mime+';base64,'+Utilities.base64Encode(bytes)})}return out.slice(0,MAX_IMAGES)}
