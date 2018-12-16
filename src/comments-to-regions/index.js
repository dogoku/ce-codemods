const commentRegex = /[/*=#]{4,}([^/*=#]*)[/*=#]{4,}/;
const newRegion = '#region';
const endRegion = '#endregion\n\n//';
const lastRegion = '\n//#endregion\n';

/**
 * Replaces custom region comments: `/****** Region Name ****** /`
 * with VSCode region comments: `//#region Region Name`.
 * 
 * Checks for 4 or more consecutive: `/` `*` `=` or `#`
 */
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const comments = j(file.source).find(j.Comment);

  let c = 0;
  return comments.forEach(path => {
    const matches = commentRegex.exec(path.value.value);
    if (!matches) { return; }

    const group = matches[1].replace(/[\r\n]+/gm,'').trim();

    path.value.type = 'CommentLine';
    path.value.value = `${c++ ? endRegion: ''}${newRegion} ${group}`;

  }, j).toSource() + (c ? lastRegion : '');
}
