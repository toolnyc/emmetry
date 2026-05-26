// JavaScript Document

/***********************************************
* AnyLink Vertical Menu- © Dynamic Drive (www.dynamicdrive.com)
* This notice MUST stay intact for legal use
* Visit http://www.dynamicdrive.com/ for full source code
***********************************************/

//Contents for menu 1
var menu1=new Array()
menu1[0]='<a href="emmet_second_generation.htm">Emmet</a>'
menu1[1]='<a href="graves_second_generation.htm">Graves</a>'
menu1[2]='<a href="leroy_second_generation.htm">LeRoy</a>'
menu1[3]='<a href="mcEvers_second_generation.htm">McEvers</a>'


//Contents for menu 2
var menu2=new Array()
menu2[0]='<a href="cunard_third_generation.htm">Cunard</a>'
menu2[1]='<a href="edgar_third_generation.htm">Edgar</a>'
menu2[2]='<a href="emmet_third_generation.htm">Emmet</a>'
menu2[3]='<a href="graves_third_generation.htm">Graves</a>'
menu2[4]='<a href="griswold_third_generation.htm">Griswold</a>'
menu2[5]='<a href="leroy_third_generation.htm">LeRoy</a>'
menu2[6]='<a href="mcEvers_third_generation.htm">McEvers</a>'
menu2[7]='<a href="whitlock_third_generation.htm">Whitlock</a>'

//Contents for menu 3, and so on
var menu3=new Array()
menu3[0]='<a href="biddle_fourth_generation.htm">Biddle</a>'
menu3[1]='<a href="cross_fourth_generation.htm">Cross</a>'
menu3[2]='<a href="cunard_fourth_generation.htm">Cunard</a>'
menu3[3]='<a href="edgar_fourth_generation.htm">Edgar</a>'
menu3[4]='<a href="emmet_fourth_generation.htm">Emmet</a>'
menu3[5]='<a href="feilding_fourth_generation.htm">Feilding</a>'
menu3[6]='<a href="forbes_fourth_generation.htm">Forbes</a>'
menu3[7]='<a href="french_fourth_generation.htm">French</a>'
menu3[8]='<a href="gosling_fourth_generation.htm">Gosling</a>'
menu3[9]='<a href="griswold_fourth_generation.htm">Griswold</a>'
menu3[10]='<a href="hadden_fourth_generation.htm">Hadden</a>'
menu3[11]='<a href="harris_fourth_generation.htm">Harris</a>'
menu3[12]='<a href="hay_fourth_generation.htm">Hay</a>'
menu3[13]='<a href="keogh_fourth_generation.htm">Keogh</a>'
menu3[14]='<a href="lapsley_fourth_generation.htm">Lapsley</a>'
menu3[15]='<a href="lawley_fourth_generation.htm">Lawley</a>'
menu3[16]='<a href="leatham_fourth_generation.htm">Leatham</a>'
menu3[17]='<a href="peabody_fourth_generation.htm">Peabody</a>'
menu3[18]='<a href="pierce_fourth_generation.htm">Pierce</a>'
menu3[19]='<a href="rand_fourth_generation.htm">Rand</a>'
menu3[20]='<a href="sherwood_fourth_generation.htm">Sherwood</a>'
menu3[21]='<a href="whitlock_fourth_generation.htm">Whitlock</a>'
		
var disappeardelay=200  //menu disappear speed onMouseout (in miliseconds)
var horizontaloffset=-25 //horizontal offset of menu from default location. (0-5 is a good value)

/////No further editting needed

var ie4=document.all
var ns6=document.getElementById&&!document.all

if (ie4||ns6)

document.write('<div id="dropmenudiv" style="visibility:hidden;width: 160px" onMouseover="clearhidemenu()" onMouseout="dynamichide(event)"></div>')

function getposOffset(what, offsettype){
var totaloffset=(offsettype=="left")? what.offsetLeft : what.offsetTop;
var parentEl=what.offsetParent;
while (parentEl!=null){
totaloffset=(offsettype=="left")? totaloffset+parentEl.offsetLeft : totaloffset+parentEl.offsetTop;
parentEl=parentEl.offsetParent;
}
return totaloffset;
}


function showhide(obj, e, visible, hidden, menuwidth){
if (ie4||ns6)
dropmenuobj.style.left=dropmenuobj.style.top=-500
dropmenuobj.widthobj=dropmenuobj.style
dropmenuobj.widthobj.width=menuwidth
if (e.type=="click" && obj.visibility==hidden || e.type=="mouseover")
obj.visibility=visible
else if (e.type=="click")
obj.visibility=hidden
}

function iecompattest(){
return (document.compatMode && document.compatMode!="BackCompat")? document.documentElement : document.body
}

function clearbrowseredge(obj, whichedge){
var edgeoffset=0
if (whichedge=="rightedge"){
var windowedge=ie4 && !window.opera? iecompattest().scrollLeft+iecompattest().clientWidth-15 : window.pageXOffset+window.innerWidth-15
dropmenuobj.contentmeasure=dropmenuobj.offsetWidth
if (windowedge-dropmenuobj.x-obj.offsetWidth < dropmenuobj.contentmeasure)
edgeoffset=dropmenuobj.contentmeasure+obj.offsetWidth
}
else{
var topedge=ie4 && !window.opera? iecompattest().scrollTop : window.pageYOffset
var windowedge=ie4 && !window.opera? iecompattest().scrollTop+iecompattest().clientHeight-15 : window.pageYOffset+window.innerHeight-18
dropmenuobj.contentmeasure=dropmenuobj.offsetHeight
if (windowedge-dropmenuobj.y < dropmenuobj.contentmeasure){ //move menu up?
edgeoffset=dropmenuobj.contentmeasure-obj.offsetHeight
if ((dropmenuobj.y-topedge)<dropmenuobj.contentmeasure) //up no good either? (position at top of viewable window then)
edgeoffset=dropmenuobj.y
}
}
return edgeoffset
}

function populatemenu(what){
if (ie4||ns6)
dropmenuobj.innerHTML=what.join("")
}


function dropdownmenu(obj, e, menucontents, menuwidth){
if (window.event) event.cancelBubble=true
else if (e.stopPropagation) e.stopPropagation()
clearhidemenu()
dropmenuobj=document.getElementById? document.getElementById("dropmenudiv") : dropmenudiv
populatemenu(menucontents)

if (ie4||ns6){
showhide(dropmenuobj.style, e, "visible", "hidden", menuwidth)
dropmenuobj.x=getposOffset(obj, "left")
dropmenuobj.y=getposOffset(obj, "top")
dropmenuobj.style.left=dropmenuobj.x-clearbrowseredge(obj, "rightedge")+obj.offsetWidth+horizontaloffset+"px"
dropmenuobj.style.top=dropmenuobj.y-clearbrowseredge(obj, "bottomedge")+"px"
}

return clickreturnvalue()
}

function clickreturnvalue(){
if (ie4||ns6) return false
else return true
}

function contains_ns6(a, b) {
while (b.parentNode)
if ((b = b.parentNode) == a)
return true;
return false;
}

function dynamichide(e){
if (ie4&&!dropmenuobj.contains(e.toElement))
delayhidemenu()
else if (ns6&&e.currentTarget!= e.relatedTarget&& !contains_ns6(e.currentTarget, e.relatedTarget))
delayhidemenu()
}

function hidemenu(e){
if (typeof dropmenuobj!="undefined"){
if (ie4||ns6)
dropmenuobj.style.visibility="hidden"
}
}

function delayhidemenu(){
if (ie4||ns6)
delayhide=setTimeout("hidemenu()",disappeardelay)
}

function clearhidemenu(){
if (typeof delayhide!="undefined")
clearTimeout(delayhide)
}



// (C) 2000 www.CodeLifter.com
// http://www.codelifter.com
// Free for all users, but leave in this header


u = window.location;
m = "Family history from emmetry.org. ";
function mailThisUrl()
{
   {
      // the following expression must be all on one line...
      window.location = "mailto:?subject="+m+"&body="+document.title+" "+u;
   }
}

// This script is (c) copyright 2006 Jim Tucek under the
// GNU General Public License (http://www.gnu.org/licenses/gpl.html)
// For more information, visit www.jracademy.com/~jtucek/email/ 
// Leave the above comments alone!

var decryption_cache = new Array();

function decrypt_string(crypted_string,n,decryption_key,just_email_address) {
	var cache_index = "'"+crypted_string+","+just_email_address+"'";

	if(decryption_cache[cache_index])					// If this string has already been decrypted, just
		return decryption_cache[cache_index];				// return the cached version.

	if(addresses[crypted_string])						// Is crypted_string an index into the addresses array
		var crypted_string = addresses[crypted_string];			// or an actual string of numbers?

	if(!crypted_string.length)						// Make sure the string is actually a string
		return "Error, not a valid index.";

	if(n == 0 || decryption_key == 0) {					// If the decryption key and n are not passed to the
		var numbers = crypted_string.split(' ');			// function, assume they are stored as the first two
		n = numbers[0];	decryption_key = numbers[1];			// numbers in crypted string.
		numbers[0] = ""; numbers[1] = "";				// Remove them from the crypted string and continue
		crypted_string = numbers.join(" ").substr(2);
	}

	var decrypted_string = '';
	var crypted_characters = crypted_string.split(' ');

	for(var i in crypted_characters) {
		var current_character = crypted_characters[i];
		var decrypted_character = exponentialModulo(current_character,n,decryption_key);
		if(just_email_address && i < 7)				// Skip 'mailto:' part
			continue;
		if(just_email_address && decrypted_character == 63)	// Stop at '?subject=....'
			break;
		decrypted_string += String.fromCharCode(decrypted_character);
	}
	
	decryption_cache[cache_index] = decrypted_string;			// Cache this string for any future calls

	return decrypted_string;
}

function decrypt_and_email(crypted_string,n,decryption_key) {
	if(!n || !decryption_key) { n = 0; decryption_key = 0; }
	if(!crypted_string) crypted_string = 0;

	var decrypted_string = decrypt_string(crypted_string,n,decryption_key,false);
	parent.location = decrypted_string;
}

function decrypt_and_echo(crypted_string,n,decryption_key) {
	if(!n || !decryption_key) { n = 0; decryption_key = 0; }
	if(!crypted_string) crypted_string = 0;

	var decrypted_string = decrypt_string(crypted_string,n,decryption_key,true);
	document.write(decrypted_string);
	return true;
}

// Finds base^exponent % y for large values of (base^exponent)
function exponentialModulo(base,exponent,y) {
	if (y % 2 == 0) {
		answer = 1;
		for(var i = 1; i <= y/2; i++) {
			temp = (base*base) % exponent;
			answer = (temp*answer) % exponent;
		}
	} else {
		answer = base;
		for(var i = 1; i <= y/2; i++) {
			temp = (base*base) % exponent;
			answer = (temp*answer) % exponent;
		}
	}
	return answer;
}
// -->

