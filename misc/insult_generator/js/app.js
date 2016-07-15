var width = $('body').width()
var height = $('body').height() *.75;
var textRatio = height *.15 + 'px'

var textX = width/2;
var textY = height/3

//simple function to capitalize strings
String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

//generic insult lists
var list1 = ['lazy','stupid','insecure','idiotic','slimy','slutty','smelly','pompous','communist',
      'dicknose','pie-eating','racist','elitist','white trash','drug-loving','butterface','tone deaf',
      'ugly','creepy','mouth breathing']
var list2 = ['douche', 'ass','turd','rectum','butt','cock','shit','crotch','bitch','prick','slut',
         'taint','fuck','dick','boner','shart','nut','sphincter']

var list3 = ['pilot','canoe','captain','pirate','hammer','knob','box','jockey','nazi','waffle','goblin',
         'blossum','biscuit','clown','socket','monster','hound','dragon','balloon', 'wanker']
//shakespearan lists
var ws1 = ['artless', 'bawdy', 'beslubbering', 'bootless', 'churlish', 'cockered', 'clouted', 'craven', 'currish', 'dankish', 'dissembling', 'droning', 'errant', 'fawning', 'fobbing', 'froward', 'frothy', 'gleeking', 'goatish', 'gorbellied', 'impertinent', 'infectious', 'jarring', 'loggerheaded', 'lumpish', 'mammering', 'mangled', 'mewling', 'paunchy', 'pribbling', 'puking', 'puny', 'qualling', 'rank', 'reeky', 'roguish', 'ruttish', 'saucy', 'spleeny', 'spongy', 'surly', 'tottering', 'unmuzzled', 'vain', 'venomed', 'villainous', 'warped', 'wayward', 'weedy', 'yeasty']
var ws2 = ['base-court', 'bat-fowling', 'beef-witted', 'beetle-headed', 'boil-brained', 'clapper-clawed', 'clay-brained', 'common-kissing', 'crook-pated', 'dismal-dreaming', 'dizzy-eyed', 'doghearted', 'dread-bolted', 'earth-vexing', 'elf-skinned', 'fat-kidneyed', 'fen-sucked', 'flap-mouthed', 'fly-bitten', 'folly-fallen', 'fool-born', 'full-gorged', 'guts-griping', 'half-faced', 'hasty-witted', 'hedge-born', 'hell-hated', 'idle-headed', 'ill-breeding', 'ill-nurtured', 'knotty-pated', 'milk-livered', 'motley-minded', 'onion-eyed', 'plume-plucked', 'pottle-deep', 'pox-marked', 'reeling-ripe', 'rough-hewn', 'rude-growing', 'rump-fed', 'shard-borne', 'sheep-biting', 'spur-galled', 'swag-bellied', 'tardy-gaited', 'tickle-brained', 'toad-spotted', 'unchin-snouted', 'weather-bitten']
var ws3 = ['apple-john', 'baggage', 'barnacle', 'bladder', 'boar-pig', 'bugbear', 'bum-bailey', 'canker-blossom', 'clack-dish', 'clotpole', 'coxcomb', 'codpiece', 'death-token', 'dewberry', 'flap-dragon', 'flax-wench', 'flirt-gill', 'foot-licker', 'fustilarian', 'giglet', 'gudgeon', 'haggard', 'harpy', 'hedge-pig', 'horn-beast', 'hugger-mugger', 'joithead', 'lewdster', 'lout', 'maggot-pie', 'malt-worm', 'mammet', 'measle', 'minnow', 'miscreant', 'moldwarp', 'mumble-news', 'nut-hook', 'pigeon-egg', 'pignut', 'puttock', 'pumpion', 'ratsbane', 'scut', 'skainsmate', 'strumpet', 'varlot', 'vassal', 'whey-face', 'wagtail']


//event listener for buttons
$('#PG13').on('click',function(){
	var status = d3.select('#PG13').attr('class')
	if (status != 'button secondary active'){
		d3.select('#PG13').attr('class', 'button secondary active')
	} else {
		d3.select('#PG13').attr('class','button secondary')
	}
})

$('#shake').on('click',function(){
	var status = d3.select('#shake').attr('class')
	if (status != 'button secondary active'){
		d3.select('#shake').attr('class', 'button secondary active')
		textRatio = height *.10 + 'px';
	} else {
		d3.select('#shake').attr('class','button secondary')
		textRatio = height*.15 + 'px';
	}

})
//generate the insult
var generateInsult = function(){
	var shake = $('#shake').attr('class')
	if (shake == 'button secondary active'){
		var s1 = ws1[Math.floor(Math.random()*ws1.length)];
		var s2 = ws2[Math.floor(Math.random()*ws2.length)];
		var s3 = ws3[Math.floor(Math.random()*ws3.length)];
		insult = 'Thou ' + s1.capitalize() + ' ' + s2.capitalize() + ' ' + s3.capitalize();

	} else {
		var s1 = list1[Math.floor(Math.random()*list1.length)];
		var s2 = list2[Math.floor(Math.random()*list2.length)];
		var rating = $('#PG13').attr('class')
		if (rating == 'button secondary active'){
			while (s2 == "shit" || s2 == 'fuck') {
				s2 = list2[Math.floor(Math.random()*list2.length)];
			}
		}
		var s3 = list3[Math.floor(Math.random()*list3.length)];
		var insult =  s1.capitalize() + ' ' + s2.capitalize() + ' ' + s3.capitalize();
	}
	return insult
};


//function to transition text
var changeText = function(text,insult){
	d3.select(text).transition()
		.delay(50)
		.duration(200)
		.style('opacity',0)
		.attr('y',height*1.25)

	d3.select(text)
		.transition()
		.delay(250)
		.duration(200)
		.attr('y',-150)
		.style('font-size',textRatio)

	d3.select(text).transition()
		.delay(450)
		.duration(250)
		.attr('y',textY)
		.style('opacity',1)
		.text(insult)
};

//append a big svg
var svg = d3.select('#svg').append('svg')
	.attr('width',width)
	.attr('height',height);

//append svg text to page
var text = svg.append('text')
	.attr('x',textX)
	.attr('y',textY)
	.attr('id','text')
	.attr('text-anchor','middle')
	.style('font-size',textRatio)
	.text("Click the button");

//main button event listener
d3.select('#button').on('click',function(){
	var insult = generateInsult()
	changeText('#text', insult)

})



