const $=id=>document.getElementById(id),fmt=c=>'$'+(c/100).toFixed(2);
// Prices are in cents. Keep categories explicit so new products are included in orders.
const drinks=[['Espresso',200,'☕'],['Cappuccino',300,'☕'],['Latte',350,'☕'],['Pumpkin Spice Latte',400,'🎃'],['Peppermint Mocha Latte',400,'☕'],['Iced Latte',350,'🧋'],['Iced Americano',250,'🧊'],['Matcha Latte',350,'🍵'],['Hot Chocolate',150,'🍫'],['Tea',150,'🫖'],['Juice Box',100,'🧃']];
const food=[['Bagel',250,'🥯'],['Hash Brown',100,'🥔'],['Croissant',150,'🥐'],['Chocolate Chip Cookie',100,'🍪'],['Peppermint Cookie',200,'🍪'],['Sugar Cookie Loaf',300,'🍰'],['Cinnamon Roll',300,'🍥'],['Pumpkin Blondies',200,'🧁'],['Chocolate Croissant',200,'🥐']];
const extras=[['Oat Milk',50,'🥛'],['Syrup',50,'🍯'],['Marshmallows',50,'☁️'],['Cream Cheese',50,'🧀'],['Egg',100,'🥚']];
const mainItems=[...drinks,...food],items=[...mainItems,...extras];
const productImages={"Espresso":"espresso","Cappuccino":"cappuccino","Latte":"latte","Pumpkin Spice Latte":"pumpkin-spice-latte","Iced Latte":"iced-latte","Matcha Latte":"matcha-latte","Hot Chocolate":"hot-chocolate","Tea":"tea","Croissant":"croissant","Chocolate Chip Cookie":"chocolate-chip-cookie","Cinnamon Roll":"cinnamon-roll-cake","Pumpkin Blondies":"pumpkin-blondies","Chocolate Croissant":"chocolate-croissant","Oat Milk":"oat-milk","Syrup":"syrup","Marshmallows":"marshmallows","Peppermint Mocha Latte":"peppermint-mocha-latte","Iced Americano":"iced-americano","Juice Box":"juice-box","Bagel":"bagel","Hash Brown":"hash-brown","Peppermint Cookie":"peppermint-cookie","Sugar Cookie Loaf":"sugar-cookie-loaf","Cream Cheese":"cream-cheese","Egg":"egg"};
let wanted=[],basket=[],coins=[],rounds=[],stage=0,attempts=[0,0,0],payTarget=0;let helpUsage={addition:0,numberLine:0,hint:0},orderItemTries=0,orderTotalTries=0,orderItemsCorrect=false,orderItemChecked=false,orderTotalCorrect=false,transactionSteps=[];
const lev=()=>Number($('level').value),cashier=()=>$('mode').value==='cashier',demo=()=>$('mode').value==='demo',freeChoice=()=>!cashier()&&!demo()&&$('shoppingStyle').value==='free',sum=a=>a.reduce((s,x)=>s+x[1],0),rand=n=>Math.floor(Math.random()*n);
function naturalOrder(list){const names=list.map(x=>{const name=x[0];return (/^(?:[aeiou])/i.test(name)?'an ':'a ')+name.toLowerCase()});if(names.length===1)return names[0];if(names.length===2)return names.join(' and ');return names.slice(0,-1).join(', ')+', and '+names[names.length-1]}
const customerVoices=['male','female','male','female','male','female','male','female','male','male','female','male','female','male','female','male','female','male','female','male'];
let activeCustomer=0;
function customerVoice(){const voices=speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang));const preferred=customerVoices[activeCustomer];const feminine=/\b(jenny|aria|zira|samantha|victoria|karen|moira|fiona|susan|hazel|female|woman)\b/i;const masculine=/\b(guy|david|mark|daniel|george|james|alex|ryan|male|man)\b/i;return voices.find(v=>(preferred==='female'?feminine:masculine).test(v.name))||voices.find(v=>v.lang.toLowerCase()==='en-ca')||voices.find(v=>v.lang.toLowerCase().startsWith('en-'))||null}
function speak(t,asCustomer=false){if(!window.speechSynthesis)return alert('Audio is unavailable in this browser.');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-CA';u.rate=.85;if(asCustomer){const v=customerVoice();if(v)u.voice=v;}speechSynthesis.speak(u)}
const resultDialog = document.createElement('dialog');
resultDialog.id = 'cafeResult';
resultDialog.setAttribute('aria-labelledby', 'cafeResultTitle');
resultDialog.setAttribute('aria-describedby', 'cafeResultMessage');
resultDialog.innerHTML = '<h2 id="cafeResultTitle"></h2><p id="cafeResultMessage"></p><form method="dialog"><button type="submit" value="ok" autofocus>OK</button></form>';
document.body.append(resultDialog);

function feedback(id, message, correct, onOkay) {
  $(id).textContent = '';
  resultDialog.dataset.correct = String(correct);
  $('cafeResultTitle').textContent = correct ? 'Good job!' : 'Try again';
  const detail = message.replace(/^Try again\.\s*|\s*Try again\.$/gi, '');
  $('cafeResultMessage').textContent = detail;
  $('cafeResultMessage').hidden = !detail;
  resultDialog.returnValue = '';
  if (onOkay) {
    resultDialog.addEventListener('close', () => {
      if (resultDialog.returnValue === 'ok') onOkay();
    }, { once: true });
  }
  resultDialog.showModal();
}
function renderMenu(){const groups=[['Drinks',drinks,0],['Food',food,drinks.length],['Extras',extras,mainItems.length]];$('menu').innerHTML=groups.map(([name,group,offset])=>'<details class="menu-group"><summary>'+name+'</summary><div class="menu-items">'+group.map((x,j)=>'<div class="item">'+(productImages[x[0]]?'<img src="images/'+productImages[x[0]]+'.jpg" alt="'+x[0]+'" loading="lazy" style="width:100%;max-width:145px;aspect-ratio:1;object-fit:cover;border-radius:10px;display:block;margin:0 auto 8px">':'<span role="img" aria-label="'+x[0]+'" style="width:100%;max-width:145px;aspect-ratio:1;display:grid;place-items:center;font-size:4rem;margin:0 auto 8px">'+x[2]+'</span>')+'<strong>'+x[0]+'</strong><p>'+fmt(x[1])+'</p><button data-add="'+(offset+j)+'">+ Add</button><button data-say="'+(offset+j)+'">🔊</button></div>').join('')+'</div></details>').join('');document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{if(stage)return;basket.push(items[Number(b.dataset.add)]);renderBasket()});document.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>{const x=items[Number(b.dataset.say)];speak(x[0]+', '+fmt(x[1]))})}
document.addEventListener('click',e=>{if(e.target.id==='checkTotal')checkTotalButton()});
function renderBasket() {
  const orderPanel = $('basket');
  const orderActions = $('checkOrder').parentElement;
  const hasItems = basket.length > 0;

  orderPanel.innerHTML = hasItems
    ? '<strong>Your order</strong><ul>' + basket.map(x => '<li><span>' + x[0] + '</span><strong>' + fmt(x[1]) + '</strong></li>').join('') + '</ul>'
    : 'Your order: Nothing selected';
  orderPanel.append(orderActions);

  if (hasItems) {
    orderPanel.insertAdjacentHTML('beforeend', '<div><label for="orderTotal">Write the total ($):</label> <input id="orderTotal" type="number" min="0" step="0.05" inputmode="decimal" placeholder="0.00"> <button id="checkTotal" type="button">Check total</button><div id="additionHelp" class="learning-help"></div></div>');
    renderAdditionHelp();
  }

  $('removeLast').disabled = stage !== 0 || !hasItems;
  $('clear').disabled = stage !== 0 || !hasItems;
}
function helpButton(kind){if(lev()===3)return '';return '<button type="button" class="help-button" data-help="'+kind+'">💡 '+(kind==='addition'?'Show addition help':kind==='numberLine'?'Show number line':'Show hint')+'</button>'}
function renderAdditionHelp(){const el=$('additionHelp');if(!el)return;el.innerHTML=helpButton('addition');}
function helpText(kind){if(kind==='addition'){const parts=basket.map(x=>fmt(x[1]));return '<strong>Add the item prices:</strong><div class="price-equation">'+parts.join(' + ')+' = ?</div><p>Try adding the dollars first, then the cents. Write your answer above.</p>'}if(kind==='numberLine'){const max=lev()===1?20:30;return '<strong>Number line (dollars)</strong><div class="number-line">'+Array.from({length:max+1},(_,i)=>'<span>'+i+'</span>').join('')+'</div><p>Start at the smaller amount. Count forward to find the difference. For cents, count by 5¢ or 25¢.</p>'}return '<strong>Hint:</strong> Compare the amount you have with the cost. Count dollars first, then cents. If you need change, subtract the cost from the amount paid.'}
document.addEventListener('click',e=>{const b=e.target.closest('[data-help]');if(!b||lev()===3)return;const kind=b.dataset.help;let panel=b.nextElementSibling;if(panel&&panel.classList.contains('help-panel')){panel.remove();b.textContent='💡 Show '+(kind==='addition'?'addition help':kind==='numberLine'?'number line':'hint');return}helpUsage[kind]++;panel=document.createElement('div');panel.className='help-panel';panel.innerHTML=helpText(kind);b.insertAdjacentElement('afterend',panel);b.textContent='Hide help';});
function paymentHelp(){if(lev()===3)return;const target=$('payment');if(!target)return;let box=$('paymentHelp');if(!box){box=document.createElement('div');box.id='paymentHelp';box.className='learning-help';target.append(box)}box.innerHTML=lev()===1?helpButton('numberLine')+' '+helpButton('hint'):helpButton('hint')}
function specificError(type){if(lev()===3)return type==='total'?'Check your total. Add the prices and try again.':'Try again.';if(type==='items')return 'Check each item in the blue customer order. Do the names and quantities match your selections?';if(type==='total')return 'Add each price in Your order. Check the dollars and cents separately.';if(type==='change')return 'Subtract the order cost from the money paid. Count forward using the number line if needed.';return 'Count the bills and coins one at a time, starting with the largest value.'}
function checkTotalButton(){if(stage!==0)return;if(!freeChoice()&&!orderItemChecked){checkOrder(false);if(!orderItemChecked)return;}checkOrder();}
function newOrder(){stage=0;basket=[];coins=[];attempts=[0,0,0];orderItemTries=0;orderTotalTries=0;orderItemsCorrect=false;orderItemChecked=false;orderTotalCorrect=false;transactionSteps=[];helpUsage={addition:0,numberLine:0,hint:0};wanted = [];
  activeCustomer = 0;
  if (demo()) {
    wanted = ['Chocolate Croissant', 'Espresso'].map(name => mainItems.find(item => item[0] === name));
  } else {
    const pool = mainItems.slice();
    const itemCount = lev() === 1 ? 1 + rand(2) : lev();
    for (let i = 0; i < itemCount; i++) wanted.push(pool.splice(rand(pool.length), 1)[0]);
    if (lev() === 3) wanted.push(extras[rand(extras.length)]);
  }
  $('shoppingStyleLabel').hidden = cashier() || demo();
  $('request').textContent=freeChoice()?'Choose anything you would like from the menu.':'I would like '+naturalOrder(wanted)+', please.';$('instructions').textContent=cashier()?'Take the order, collect payment, and calculate change.':(freeChoice()?'Choose your own items, add their prices, and pay for your order.':'Select the requested items and pay for your order.');$('orderFeedback').textContent='';$('moneyFeedback').textContent='';$('changeFeedback').textContent='';$('cashierStage').hidden=true;$('customerPayment').hidden=false;$('payment').hidden=true;$('changeBox').hidden=true;$('checkOrder').disabled=false;$('clear').disabled=false;$('removeLast').disabled=true;$('next').disabled=true;$('checkMoney').disabled=false;$('checkChange').disabled=false;renderMenu();renderBasket();updateSend()}
function checkOrder(showItemSuccess=true){attempts[0]++;if(!freeChoice()&&!orderItemChecked){orderItemTries++;if(basket.map(x=>x[0]).sort().join('|')!==wanted.map(x=>x[0]).sort().join('|'))return feedback('orderFeedback',specificError('items'),false);orderItemsCorrect=true;orderItemChecked=true;if(showItemSuccess)feedback('orderFeedback','Your order is correct. Now check the total.',true);return}if(freeChoice()&&!basket.length)return feedback('orderFeedback','Choose at least one item before checking out.',false);orderTotalTries++;const entered=$('orderTotal');if(!entered||entered.value.trim()===''||Math.round(Number(entered.value)*100)!==sum(basket))return feedback('orderFeedback',specificError('total'),false);orderTotalCorrect=true;stage=1;$('checkOrder').disabled=true;$('clear').disabled=true;$('removeLast').disabled=true;startPayment();
  feedback('orderFeedback', 'Your total is correct. You’re ready for payment.', true, () => {
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    $('payment').scrollIntoView({ behavior, block: 'start' });
  });
}

const DENOMS = [
  {v: 2000, n: '$20 bill', image: '20-dollar', kind: 'bill'},
  {v: 1000, n: '$10 bill', image: '10-dollar', kind: 'bill'},
  {v: 500, n: '$5 bill', image: '5-dollar', kind: 'bill'},
  {v: 200, n: '$2 coin', image: 'toonie', kind: 'coin'},
  {v: 100, n: '$1 coin', image: 'loonie', kind: 'coin'},
  {v: 25, n: '25¢ coin', image: 'quarter', kind: 'coin'},
  {v: 10, n: '10¢ coin', image: 'dime', kind: 'coin'},
  {v: 5, n: '5¢ coin', image: 'nickel', kind: 'coin'}
];
const denom=v=>DENOMS.find(d=>d.v===v),moneySum=a=>a.reduce((s,v)=>s+v,0);
function moneyVisual(value) {
  const money = denom(value);
  return '<img class="money-image '+money.kind+'" src="images/'+money.image+'.png" alt="'+money.n+'" draggable="false">';
}
function moneySet(level){return DENOMS.filter(d=>level===1?[500,200,100,25].includes(d.v):level===2?d.v<=1000:true)}
let cashierPayment=[],cashierPaid=0,cashierRounds=0,cashierPaymentType='',wallet=[],walletTries=0,walletCount=0,walletCorrect=0,affordTries=0,affordCorrect=0,paidTries=0,paidCorrect=0,changeDecisionTries=0,changeDecisionCorrect=0,changeTries=0,changeCorrect=0,changeDue=0;
function randomWallet(cost,forceEnough=false){const ds=moneySet(lev()).map(d=>d.v);let w=[];for(let tries=0;tries<100;tries++){w=Array.from({length:2+rand(lev()*2+3)},()=>ds[rand(ds.length)]);const total=moneySum(w);if(forceEnough?total>=cost:walletCount===0?true:Math.random()<.5?total<cost:total>=cost)break}if(forceEnough&&moneySum(w)<cost){while(moneySum(w)<cost)w.push(ds[0])}return w}

function makeCashierMoney(cost,type){const ds=moneySet(lev()).map(d=>d.v).sort((a,b)=>b-a),target=type==='exact'?cost:type==='short'?Math.max(0,cost-25*(1+rand(Math.min(8,Math.max(1,Math.floor(cost/25)))))):cost+25*(1+rand(12));let remaining=target,w=[];for(const v of ds){while(remaining>=v&&w.length<24){w.push(v);remaining-=v}}if(remaining>0){while(remaining>=5){w.push(5);remaining-=5}}return w.sort(()=>Math.random()-.5)}
function startCashierPayment(){$('paymentPrompt').textContent='Count the money the customer gives you.';cashierPaid=0;cashierRounds=0;cashierPayment=[];$('cashierStage').hidden=false;$('cashierCount').hidden=false;$('cashierEnough').hidden=true;$('cashierFeedback').textContent='';$('changeBox').hidden=true;nextCashierPayment()}
function nextCashierPayment(){walletTriesAtStart=walletTries;affordTriesAtStart=affordTries;cashierRounds++;cashierPaymentType=cashierRounds>=4?'more':['exact','more','short'][rand(3)];if(cashierRounds>1&&cashierPaymentType==='exact')cashierPaymentType='more';const remaining=sum(basket)-cashierPaid;cashierPayment=makeCashierMoney(Math.max(remaining,25),cashierPaymentType);if(cashierRounds>=4&&moneySum(cashierPayment)<remaining)cashierPayment=makeCashierMoney(remaining,'more');$('cashierMoney').innerHTML=cashierPayment.map(moneyVisual).join('');$('cashierAmount').value='';$('cashierEnough').hidden=true;$('cashierCount').hidden=false;$('cashierFeedback').textContent='';$('cashierPrompt').textContent=cashierRounds===1?'The customer hands you this money. Count it.':'The customer gives you more money. Count this additional payment.'}
$('cashierCheckCount').onclick=()=>{if($('cashierCount').hidden||stage!==1)return;walletTries++;const v=$('cashierAmount').value;if(v===''||Math.round(Number(v)*100)!==moneySum(cashierPayment))return feedback('cashierFeedback',specificError('money'),false);walletCorrect++;cashierPaid+=moneySum(cashierPayment);transactionSteps.push({name:'Counted customer payment '+cashierRounds,attempts:walletTries-walletTriesAtStart,correct:true,amount:moneySum(cashierPayment)});$('cashierCount').hidden=true;$('cashierEnough').hidden=false;feedback('cashierFeedback','Correct. Now decide if the customer gave enough money.',true)};
let walletTriesAtStart=0,affordTriesAtStart=0;
function cashierEnough(yes){if($('cashierEnough').hidden||stage!==1)return;affordTries++;if(yes!==(cashierPaid>=sum(basket)))return feedback('cashierFeedback','Compare the amount received with the order total. Try again.',false);affordCorrect++;transactionSteps.push({name:'Enough money received '+cashierRounds,attempts:affordTries-affordTriesAtStart,correct:true,answer:yes?'Yes':'No'});if(!yes){feedback('cashierFeedback','Correct. Ask the customer for more money.',true);nextCashierPayment()}else{changeDue=cashierPaid-sum(basket);$('cashierStage').hidden=true;stage=2;$('changeBox').hidden=false;$('changeAmount').hidden=true;$('changeFeedback').textContent='';$('changePrompt').textContent='Does the customer need change?';feedback('cashierFeedback','The customer gave enough. Now decide if they need change.',true);}}
$('cashierYes').onclick=()=>cashierEnough(true);$('cashierNo').onclick=()=>cashierEnough(false);

function showWallet(){$('changePrompt').textContent='Should you receive change?';walletCount++;wallet=demo() ? [500, 100, 25, 25] : randomWallet(sum(basket),walletCount>=4);coins=[];$('walletTotal').value='';$('walletFeedback').textContent='';$('affordStage').hidden=true;$('walletStage').hidden=false;$('payStage').hidden=true;$('checkMoney').hidden=true;$('changeBox').hidden=true;$('walletMoney').innerHTML = wallet.map(moneyWithCalculatorValue).join('');
setCalculatorValues($('walletValuesButton'), false);$('paymentPrompt').textContent='Count the money in your wallet. Your order costs '+fmt(sum(basket))+'.';}
function startPayment(){$('payment').hidden=false;paymentHelp();const cost=sum(basket);$('receipt').innerHTML='<ul>'+basket.map(x=>'<li>'+x[0]+' — '+fmt(x[1])+'</li>').join('')+'</ul><strong>Total checked: '+fmt(cost)+'</strong>';walletCount=0;walletTries=0;walletCorrect=0;affordTries=0;affordCorrect=0;paidTries=0;paidCorrect=0;changeDecisionTries=0;changeDecisionCorrect=0;changeTries=0;changeCorrect=0;$('moneyFeedback').textContent='';$('cashierStage').hidden=!cashier();$('customerPayment').hidden=cashier();if(cashier())startCashierPayment();else showWallet()}
function moneyWithCalculatorValue(value) {
  return '<div class="money-with-value">' + moneyVisual(value) +
    '<span class="money-calculator-value" hidden>' + (value / 100).toFixed(2) + '</span></div>';
}

function setCalculatorValues(button, visible) {
  if (!button) return;
  button.setAttribute('aria-expanded', String(visible));
  button.textContent = visible ? 'Hide calculator values' : 'Show calculator values';
  $(button.getAttribute('aria-controls')).querySelectorAll('.money-calculator-value').forEach(label => {
    label.hidden = !visible;
  });
}

for (const id of ['walletValuesButton', 'practiceValuesButton']) {
  const button = $(id);
  if (button) {
    button.onclick = () => setCalculatorValues(button, button.getAttribute('aria-expanded') === 'false');
  }
}

$('checkWallet').onclick=()=>{walletTries++;if(Math.round(Number($('walletTotal').value)*100)!==moneySum(wallet)||$('walletTotal').value==='')return feedback('walletFeedback',specificError('money'),false);walletCorrect++;feedback('walletFeedback','Correct! Now decide if you have enough.',true);$('affordStage').hidden=false};
function answerAfford(yes){if(cashier()||$('affordStage').hidden)return;affordTries++;const enough=moneySum(wallet)>=sum(basket);if(yes!==enough)return feedback('walletFeedback','Try again. Compare your wallet with the order total.',false);affordCorrect++;if(!enough){feedback('walletFeedback','Correct. You need another wallet.',true);showWallet()}else{feedback('walletFeedback','Correct. Choose money from your wallet to pay.',true);$('walletStage').hidden=true;$('payStage').hidden=false;$('checkMoney').hidden=false;$('coins').innerHTML=wallet.map((v,i)=>'<button class="money-choice" data-index="'+i+'" aria-pressed="false">'+moneyVisual(v)+'</button>').join('');document.querySelectorAll('[data-index]').forEach(b=>b.onclick=()=>{if(stage!==1)return;b.classList.toggle('chosen');b.setAttribute('aria-pressed',b.classList.contains('chosen')?'true':'false');renderCoins()});renderCoins()}}
$('affordYes').onclick=()=>answerAfford(true);$('affordNo').onclick=()=>answerAfford(false);
function renderCoins(){coins=[...document.querySelectorAll('.money-choice.chosen')].map(b=>wallet[Number(b.dataset.index)]);$('selectedMoney').textContent=coins.length+' selected (calculate the amount yourself).'}
function checkMoney(){if(stage!==1||cashier())return;paidTries++;const paid=moneySum(coins),entered=$('paidTotal').value;if(!coins.length||entered===''||Math.round(Number(entered)*100)!==paid||paid<sum(basket))return feedback('moneyFeedback','Check the selected money and the amount you entered. Try again.',false);paidCorrect++;feedback('moneyFeedback','Payment accepted!',true);stage=2;$('checkMoney').disabled=true;document.querySelectorAll('.money-choice').forEach(b=>b.disabled=true);changeDue=paid-sum(basket);$('changeBox').hidden=false;$('changeAmount').hidden=true;$('changeFeedback').textContent=''}
function answerChange(yes){if(stage!==2||!$('changeAmount').hidden)return;changeDecisionTries++;if(yes!==(changeDue>0))return feedback('changeFeedback','Try again. Is the payment more than the cost?',false);changeDecisionCorrect++;if(!yes){feedback('changeFeedback','Correct. No change is needed.',true);complete(0)}else{$('changeAmount').hidden=false;feedback('changeFeedback','Correct. Now calculate the change.',true)}}
$('changeYes').onclick=()=>answerChange(true);$('changeNo').onclick=()=>answerChange(false);
function checkChange(){if(stage!==2||$('changeAmount').hidden)return;changeTries++;if($('change').value.trim()===''||Math.round(Number($('change').value)*100)!==changeDue)return feedback('changeFeedback',specificError('change'),false);changeCorrect++;feedback('changeFeedback','Correct!',true);$('checkChange').disabled=true;complete(changeDue)}
function complete(change){if(stage===3)return;stage=3;rounds.push({assistance:{...helpUsage},mode:$('mode').value,level:lev(),shoppingStyle:cashier()?'Cashier':freeChoice()?'Free Choice':'Shopping List',items:basket.map(x=>x[0]),total:sum(basket),paid:cashier()?cashierPaid:moneySum(coins),change,attempts:attempts.slice(),steps:[...(freeChoice()?[]:[{name:'Selected correct items',attempts:orderItemTries,correct:orderItemsCorrect}]),{name:'Calculated order total',attempts:orderTotalTries,correct:orderTotalCorrect},...transactionSteps,{name:cashier()?'Counted customer payment':'Counted wallet',attempts:walletTries,correct:walletCorrect>0},{name:cashier()?'Enough money received':'Enough money available',attempts:affordTries,correct:affordCorrect>0},...(cashier()?[]:[{name:'Selected money to pay',attempts:paidTries,correct:paidCorrect>0}]),{name:'Decided whether change needed',attempts:changeDecisionTries,correct:changeDecisionCorrect>0},...(change>0?[{name:'Calculated change',attempts:changeTries,correct:changeCorrect>0}]:[])],skills:{wallets:cashier()?cashierRounds:walletCount,walletCountAttempts:walletTries,walletCountCorrect:walletCorrect,enoughAttempts:affordTries,enoughCorrect:affordCorrect,paymentAttempts:paidTries,paymentCorrect:paidCorrect,changeDecisionAttempts:changeDecisionTries,changeDecisionCorrect,changeAttempts:changeTries,changeCorrect}});$('next').disabled=false;$('progress').textContent='Completed orders: '+rounds.length;updateSend()}
const key='pauseCafeSubmissionCount',sent=()=>Math.min(3,Math.max(0,Number(sessionStorage.getItem(key))||0));function updateSend(){$('sendTeacher').disabled=rounds.length<3||sent()>=3;$('sendNote').textContent=sent()>=3?'Submission limit reached (3).':rounds.length<3?'Complete '+(3-rounds.length)+' more orders to send.':rounds.length+' completed · '+sent()+' of 3 submissions used.'}
$('speak').onclick=()=>speak($('request').textContent,true);$('removeLast').onclick=()=>{if(stage!==0||!basket.length)return;basket.pop();orderItemChecked=false;orderItemsCorrect=false;$('orderFeedback').textContent='';renderBasket()};$('clear').onclick=()=>{if(stage!==0)return;basket=[];orderItemChecked=false;orderItemsCorrect=false;$('orderFeedback').textContent='';renderBasket()};$('checkOrder').onclick=checkOrder;$('undo').onclick=()=>{if(stage===1){document.querySelector('.money-choice.chosen:last-of-type')?.click()}};$('resetMoney').onclick=()=>{if(stage===1){document.querySelectorAll('.money-choice.chosen').forEach(b=>b.click())}};$('checkMoney').onclick=checkMoney;$('checkChange').onclick=checkChange;$('next').onclick=newOrder;for(const id of ['level','mode','shoppingStyle'])$(id).onchange=()=>{rounds=[];$('progress').textContent='Completed orders: 0';newOrder()};newOrder();
let practiceSkill='',practiceQ=null,practiceStats={},enoughOutcomes=[];
const practiceNames={'count':'Count the Money','enough':'Do I Have Enough?','pay':'Choose How to Pay','change':'Making Change'};
$('practiceChoices').innerHTML=Object.entries(practiceNames).map(([k,v])=>'<button data-skill="'+k+'">'+v+'</button>').join('');
$('practiceToggle').onclick=()=>{const showing=$('practiceHome').hidden;if(showing){$('practiceActivity').hidden=true;$('practiceChoices').hidden=false;}$('practiceHome').hidden=!showing;$('cafeMain').hidden=showing;$('practiceToggle').textContent=showing?'Return to Café Purchase':'Practise Your Money Skills';};
document.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>{practiceSkill=b.dataset.skill;$('practiceChoices').hidden=true;$('practiceActivity').hidden=false;$('practiceTitle').textContent=practiceNames[practiceSkill];practiceStats[practiceSkill]??={questions:0,attempts:0,firstCorrect:0};nextPractice()});
$('practiceBack').onclick=()=>{$('practiceActivity').hidden=true;$('practiceChoices').hidden=false};
$('practiceNext').onclick=nextPractice;
function nextPractice(){updatePracticeProgress();const ds=moneySet(lev()).map(x=>x.v);let cost=(2+rand(12))*50;let w=Array.from({length:2+rand(lev()+3)},()=>ds[rand(ds.length)]);if(practiceSkill==='enough'){if(!enoughOutcomes.length){enoughOutcomes=[true,true,true,true,true,false,false,false,false,false];for(let i=enoughOutcomes.length-1;i>0;i--){const j=rand(i+1);[enoughOutcomes[i],enoughOutcomes[j]]=[enoughOutcomes[j],enoughOutcomes[i]];}}const enough=enoughOutcomes.pop();const small=ds.filter(v=>v<=500);w=Array.from({length:2+rand(lev()+3)},()=>small[rand(small.length)]);const sum=moneySum(w);if(enough){const maxUnits=Math.floor(sum/50);if(maxUnits<1){w.push(100); }cost=(1+rand(Math.floor(moneySum(w)/50)))*50;}else{cost=(Math.floor(sum/50)+1+rand(6))*50;}}if(practiceSkill==='pay'){w=[500,200,200,100,100,25,25];}const total=moneySum(w);practiceQ={w,cost,total,tries:0,selected:[],done:false};$('practiceQuestion').textContent=practiceSkill==='count'?'How much money do you see?':practiceSkill==='enough'?'Count the wallet. The item costs '+fmt(cost)+'. Do you have enough?':practiceSkill==='pay'?'Choose bills and coins to pay at least '+fmt(cost)+'. Then enter the amount selected.':'You pay '+fmt(total)+ ' for an item costing '+fmt(Math.min(cost,total))+'. How much change should you get?';$('practiceMoney').innerHTML=(practiceSkill === 'pay'
    ? w.map((v, i) => '<button type="button" data-practice-coin="'+i+'" class="practice-coin" aria-pressed="false">'+moneyVisual(v)+'</button>')
    : w.map(practiceSkill === 'count' ? moneyWithCalculatorValue : moneyVisual)).join('');
  const valuesButton = $('practiceValuesButton');
  if (valuesButton) {
    valuesButton.hidden = practiceSkill !== 'count';
    setCalculatorValues(valuesButton, false);
  }
  $('practiceControls').innerHTML=practiceSkill==='enough'?'<label>Wallet total ($) <input id="practiceInput" type="number" step=".05"></label><button id="practiceCheck">Check total</button><div id="practiceYN" hidden><div id="practiceComparison"></div><p><strong>Do you have enough money?</strong></p><button id="practiceYes">Yes</button><button id="practiceNo">No</button></div>':'<label>Answer ($) <input id="practiceInput" type="number" step=".05"></label><button id="practiceCheck">Check answer</button>';$('practiceFeedback').textContent='';$('practiceNext').disabled=true;document.querySelectorAll('[data-practice-coin]').forEach(b=>b.onclick=()=>{b.setAttribute('aria-pressed', b.classList.toggle('chosen'));practiceQ.selected=[...document.querySelectorAll('[data-practice-coin].chosen')].map(x=>w[Number(x.dataset.practiceCoin)])});$('practiceCheck').onclick=()=>{if(practiceQ.done)return;practiceQ.tries++;practiceStats[practiceSkill].attempts++;const value=$('practiceInput').value,amount=value===''?NaN:Math.round(Number(value)*100);const correct=practiceSkill==='count'||practiceSkill==='enough'?total:practiceSkill==='pay'?moneySum(practiceQ.selected):total-Math.min(cost,total);if(amount!==correct||(practiceSkill==='pay'&&correct<cost)){feedback('practiceFeedback','Try again. Count carefully.',false);return}if(practiceSkill==='enough'){renderPracticeComparison(total,cost);$('practiceYN').hidden=false;feedback('practiceFeedback','Correct. Now answer Yes or No.',true)}else finishPractice()};if(practiceSkill==='enough'){$('practiceYes').onclick=()=>answerPracticeEnough(true);$('practiceNo').onclick=()=>answerPracticeEnough(false)}}
function renderPracticeComparison(wallet,cost){
 const max=Math.max(wallet,cost,100),rough=max/4,power=10**Math.floor(Math.log10(rough)),step=([1,2,5,10].find(n=>n*power>=rough)||10)*power,limit=Math.ceil(max/step)*step;
 const y=v=>220-180*v/limit;
 const ticks=Array.from({length:Math.round(limit/step)+1},(_,i)=>'<line x1="76" x2="344" y1="'+y(i*step)+'" y2="'+y(i*step)+'" stroke="#9ca3af" stroke-dasharray="4 4"/><text x="68" y="'+(y(i*step)+5)+'" text-anchor="end" font-size="13" fill="currentColor">'+fmt(i*step)+'</text>').join('');
 const bar=(x,value,color,label)=>'<rect x="'+(x-36)+'" y="'+y(value)+'" width="72" height="'+(220-y(value))+'" fill="'+color+'" rx="3"/><text x="'+x+'" y="'+(y(value)-9)+'" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">'+fmt(value)+'</text><text x="'+x+'" y="244" text-anchor="middle" font-size="15" font-weight="bold" fill="currentColor">'+label+'</text>';
 $('practiceComparison').innerHTML='<div style="padding:12px;margin:12px 0;border:1px solid #9ca3af;border-radius:10px"><strong>Compare the amounts</strong><svg viewBox="0 0 360 260" role="img" aria-label="Wallet '+fmt(wallet)+', item cost '+fmt(cost)+'" style="display:block;width:100%;max-width:520px;height:auto;margin:auto">'+ticks+'<path d="M76 40 V220 H344" fill="none" stroke="currentColor" stroke-width="1.5"/>'+bar(145,wallet,'#3685cf','Your wallet')+bar(275,cost,'#e49b36','Item cost')+'</svg></div>';
}
function answerPracticeEnough(yes){if(practiceQ.done)return;practiceQ.tries++;practiceStats[practiceSkill].attempts++;if(yes!==(practiceQ.total>=practiceQ.cost))return feedback('practiceFeedback','Try again. Compare the amounts.',false);finishPractice()}
function updatePracticeProgress(){const stats=practiceStats[practiceSkill];$('practiceProgress').textContent=practiceSkill==='count'?'Correct on first try: '+stats.firstCorrect+' / '+stats.questions:practiceNames[practiceSkill]+': '+stats.questions+' completed; '+stats.firstCorrect+' correct without retries.';}
function finishPractice(){if(practiceQ.done)return;practiceQ.done=true;practiceStats[practiceSkill].questions++;if(practiceQ.tries===(practiceSkill==='enough'?2:1))practiceStats[practiceSkill].firstCorrect++;if(typeof updatePracticeSend==='function')updatePracticeSend();feedback('practiceFeedback','Your answer is correct.',true);$('practiceNext').disabled=false;updatePracticeProgress()}
