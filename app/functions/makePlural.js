exports.makePlural = (str) => {

    // For model name reason
    if(str.includes('_')) return str;
    /** ------------------------------ */

    let tips, exceptions, exceptionFlag;
    const consonants = 'bcdfghjklmnprstwvxqz';

    /** Rule 
     *  Mutant plurals
     *  Irregular nouns follow no specific rules, so it’s best to memorize these or look up the proper pluralization in the dictionary.
     */
    exceptions = [
        {from: 'child',    to: 'children'},
        {from: 'goose',    to: 'geese'},
        {from: 'woman',    to: 'women'},
        {from: 'man',      to: 'men'},
        {from: 'tooth',    to: 'teeth'},
        {from: 'foot',     to: 'feet'},
        {from: 'child',    to: 'children'},
        {from: 'mouse',    to: 'mice'},
        {from: 'person',   to: 'people'},
        {from: 'louse',    to: 'lice'},
        {from: 'datum',    to: 'data'}
    ];
    for(let i=0; i<exceptions.length; i++){
        if(str == exceptions[i].from) return exceptions[i].to;
    }


    /** Rule #2
     *  If the singular noun ends in ‑s, -ss, -sh, -ch, -x, or -z, add ‑es to the end to make it plural.
     */
    tips = [
        's', 'ss', 'sh', 'ch', 'x', 'z'
    ];

    for(let i=0; i<tips.length; i++){

        if(str.endsWith(tips[i]) && !str.endsWith('us') && !str.endsWith('is')) return `${str}es`;
        

    }

    /** Rule #3 
     *  If the noun ends with ‑f or ‑fe, the f is often changed to ‑ve before adding the -s to form the plural version.
    */
    tips = [
        {from: 'fe', to: 'ves'},
        {from: 'f', to: 'ves'}
    ];

    exceptions = [
        'roof', 'belief', 'chef', 'chief'
    ];

    for(let i=0; i<exceptions.length; i++){
        if(str == exceptions[i]){
            exceptionFlag = true;
        } 
    }

    for(let i=0; i<tips.length; i++){

        if(str.endsWith(tips[i].from) && !exceptionFlag ){
            return str.replace(tips[i].from, tips[i].to);
        }
    }


    /** Rule #4
     *  If a singular noun ends in ‑y and the letter before the -y is a consonant, change the ending to ‑ies to make the *  noun plural
     */
    for(let i=0; i<consonants.length; i++){

        if(str.endsWith('y') && str.charAt(str.length-2) == consonants.charAt([i])){
            return str.slice(0, str.length-1) + 'ies';
        }
    }


    /** Rule #5
     *  If the singular noun ends in ‑o, add ‑es to make it plural but thera exceptions...
     */
    exceptions = [
        'photo', 'piano', 'halo'
    ];

    for(let i=0; i<exceptions.length; i++){
        if(str == exceptions[i]) exceptionFlag = true;
    }

    if(str.endsWith('o') && !exceptionFlag) return `${str}es`;
    

    /** Rule #6
     *  If the singular noun ends in ‑us, the plural ending is frequently ‑i.
     */
    if(str.endsWith('us')){
        return str.slice(0, str.length-2) + 'i';
    }


    /** Rule #7
     *  If the singular noun ends in ‑is, the plural ending is ‑es.
     */
    if(str.endsWith('is')){
        return str.slice(0, str.length-2) + 'es';
    }


    /** Rule #8
     *  If the singular noun ends in ‑on, the plural ending is ‑a.
     */
    if(str.endsWith('on') && !str.endsWith('ion')){
        return str.slice(0, str.length-2) + 'a';
    }


    /** Rule #9
     *  Some nouns don’t change at all when they’re pluralized.
     */
    exceptions = [
        'sheep',
        'series',
        'species',
        'deer',
        'fish'
    ];
    for(let i=0; i<exceptions.length; i++){
        if(str == exceptions[i]) return str;
    }


    /** If any rule so general */

    return `${str}s`;
}