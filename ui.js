let selectors = $('.selector'), openPopup = $('#open-interactive, #close-interactive'), popup = $('#interactive');

//Кнопки меню
let buttonApply = $('#button-apply'), buttonPause = $('#button-pause'), 
	buttonStep = $('#button-step'), buttonRestart = $('#button-restart');

let uiOnApply = [], uiOnRestart = [], uiOnPause = [], uiOnUnpause = [], uiOnStep = [];

//Привязывет события на клик мыши по полям селекторов
for(let i = 0; i < selectors.length; i++){
	let s = selectors.filter(':eq('+i+')');

	$('li', s).click(function(e){
		$(this).toggleClass('active-s');
		selectorBorders(s);
	});

	selectorBorders(s);
}
//Привязка анимации кнопки и открытия/закрытия меню
openPopup.click(function(e) {
	e.preventDefault();
	openPopup.toggleClass('active');
	if(openPopup.hasClass('active')) popup.addClass('active');
	else popup.removeClass('active');
});

//Привязка событий
buttonApply.click(function(e) { callFunctions( uiOnApply ); });
buttonRestart.click(function(e) { 
	buttonRestart.removeClass('active');
	setTimeout(function(){ buttonRestart.addClass('active'); }, 15);
	callFunctions( uiOnRestart ); 
});
buttonStep.click(function(e) { callFunctions( uiOnStep ); });
buttonPause.click(function(e) { 
	buttonPause.toggleClass('active');
	if(buttonPause.hasClass('active')) callFunctions( uiOnPause ); 
	else callFunctions( uiOnUnpause ); 
});




/* +-+-+-+-+-+-+-+-+-+-+-+ НУЖНЫЕ ФУНКЦИИ +-+-+-+-+-+-+-+-+-+-+-+-+*/

//Методы привязки собственных событий к кликам по кнопкам (Функция исполняется при событии)
function onApply( f ) { uiOnApply[uiOnApply.length] = f; }
function onRestart( f ) { uiOnRestart[uiOnRestart.length] = f; }
function onPause( f ) { uiOnPause[uiOnPause.length] = f; }
function onUnpause( f ) { uiOnUnpause[uiOnUnpause.length] = f; }
function onStep( f ) { uiOnStep[uiOnStep.length] = f; }

//Методы управления интерфейсом (методы не активируют функции, привязанные в onStep, onRestart и onPause/onUnpause)

//Воспроизводит анимацию нажатия кнопки шага
function animStep(){
	buttonStep.addClass('active');
	setTimeout(function(){ buttonStep.removeClass('active'); }, 150);
}
//Воспроизводит анимацию кнопки рестарта
function animRestart(){
	buttonRestart.removeClass('active');
	setTimeout(function(){ buttonRestart.addClass('active'); }, 15);
}
//Ставит кнопку паузы в определенное положение
function animPause(){
	buttonPause.addClass('active');
}
function animUnpause(){
	buttonPause.removeClass('active');
}

//Возвращает true, если сейчас кнопка паузы активна
function isPaused() {
	return buttonPause.hasClass('active');;
}


//Возвращают параметры, выбранные на селекторе S/B в формате [1,2,5...]
function getSParameters(){
	return getParameters('#selector-s');
}
function getBParameters(){
	return getParameters('#selector-b');
}
//Принимают формат параметров [1,2,5...] и выставляют их на селекторе S/B
function setSParameters(params){
	setParameters(params, '#selector-s');
}
function setBParameters(params){
	setParameters(params, '#selector-b');
}

/* +-+-+-+-+-+-+-+-+-+-+-+ ------------ +-+-+-+-+-+-+-+-+-+-+-+-+*/





//Общий вид функций выше, selector - айди элемента
function setParameters(params, selector) {
	let elements = $('li', selector);
	for(let i = 0; i < elements.length; i++){
		let cur = elements.filter(':eq('+i+')'),
				status = false;
		for(let k = 0; k < params.length; k++) {
			if(params[k] == parseInt(cur.attr('data-param')) ) {
				status = true;
				cur.addClass('active-s');
			}
		}
		if(!status) cur.removeClass('active-s');
	}
	selectorBorders(selector);
}
function getParameters(selector) {
	let params = [], elements = $('li', selector);
	for(let i = 0; i < elements.length; i++){
		let cur = elements.filter(':eq('+i+')');
		if(cur.hasClass('active-s'))
		params[params.length] = parseInt(cur.attr('data-param'));
	}
	return params;
}

//Расставляет классы полям селектора, чтобы скругления правильно ложились
function selectorBorders(selector) {
	let elements = $('li', selector);
	for(let i = 0; i < elements.length; i++){
		let te = elements.filter(':eq('+i+')'),
			ne = elements.filter(':eq('+(i == 0 ? elements.length : i-1)+')'),
			pe = elements.filter(':eq('+(i+1)+')');

		if(!pe.hasClass('active-s')) te.addClass('last-s');
		else te.removeClass('last-s');

		if(!ne.hasClass('active-s')) te.addClass('first-s');
		else te.removeClass('first-s');
	}	
}
//Вызывает все функции из массива
function callFunctions(functions) {
	for(let i = 0; i < functions.length; i++) functions[i]();
}