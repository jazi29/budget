(function(){
var KEY='budget.v1', CUR=' ₸';
var CATS={out:['Еда','Транспорт','Дом','Здоровье','Покупки','Развлечения','Рассрочка','Кредит','Другое'],in:['Зарплата','Подработка','Подарок','Другое']};
var MONTHS=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
var tx=[], view=new Date(), form={type:'out',cat:'',id:null};
view.setDate(1);
function $(i){return document.getElementById(i)}
function load(){try{var r=localStorage.getItem(KEY);tx=r?JSON.parse(r):[];if(!Array.isArray(tx))tx=[]}catch(e){tx=[]}}
function store(){try{localStorage.setItem(KEY,JSON.stringify(tx))}catch(e){toast('Не удалось сохранить')}}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function iso(d){var m=d.getMonth()+1,x=d.getDate();return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(x<10?'0':'')+x}
function money(n){return n.toLocaleString('ru-RU',{maximumFractionDigits:2})+CUR}
function toast(t){var e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove('on')},2200)}
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function dayLabel(s){var d=new Date(s+'T00:00:00'),t=iso(new Date()),y=new Date();y.setDate(y.getDate()-1);
 if(s===t)return 'Сегодня';if(s===iso(y))return 'Вчера';return d.getDate()+' '+MONTHS[d.getMonth()].toLowerCase().replace(/[ьй]$/,'я').replace('мая','мая').replace('марта','марта')}
var GEN=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function dl(s){var t=iso(new Date()),y=new Date();y.setDate(y.getDate()-1);
 if(s===t)return 'Сегодня';if(s===iso(y))return 'Вчера';var d=new Date(s+'T00:00:00');return d.getDate()+' '+GEN[d.getMonth()]}

function renderOps(){
 var dm=tab==='ops'&&mode==='day',dstr=iso(dayView),tdy=iso(today0());
 $('mlabel').textContent=dm?dayView.getDate()+' '+GEN[dayView.getMonth()]+(dayView.getFullYear()!==new Date().getFullYear()?' '+dayView.getFullYear():''):MONTHS[view.getMonth()]+' '+view.getFullYear();
 var p=view.getFullYear()+'-'+('0'+(view.getMonth()+1)).slice(-2);
 var m=tx.filter(function(t){return dm?t.date===dstr:t.date.indexOf(p)===0}).sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:(b.id>a.id?1:-1)});
 var si=0,so=0,byCat={};
 m.forEach(function(t){if(t.type==='in')si+=t.amount;else{so+=t.amount;byCat[t.cat]=(byCat[t.cat]||0)+t.amount}});
 var b=si-so;
 var all=walletNow(),nw=new Date(),isCM=nw.getFullYear()===view.getFullYear()&&nw.getMonth()===view.getMonth();
 countTo('bal',all,fm);
 $('msub').textContent=dm?(dstr===tdy?'Сегодня':'За этот день')+': '+sg(b)+'  ·  За месяц: '+sg(sums(dayView.getFullYear(),dayView.getMonth()).n):(isCM?'В этом месяце':MONTHS[view.getMonth()]+' '+view.getFullYear())+': '+sg(b);
 var atCur=dm?dstr===tdy:isCM;$('mtag').textContent=dm?(atCur?'Сегодня':'К сегодняшнему дню'):(atCur?'Текущий месяц':'К текущему месяцу');$('mtag').className='mtag'+(atCur?'':' go');
 $('bal').className='sum '+(all<0?'out':'');
 countTo('sin',si,money);countTo('sout',so,money);
 var c=$('cats');c.textContent='';
 var keys=Object.keys(byCat).sort(function(a,b){return byCat[b]-byCat[a]});
 if(keys.length){var w=el('div','cats');keys.forEach(function(k){var r=el('div','cat'),h=el('div');h.appendChild(catName(k));h.appendChild(el('span',null,money(byCat[k])+' ('+Math.round(byCat[k]/so*100)+'%)'));var bar=el('div','bar'),i=el('i');i.style.width=Math.max(3,byCat[k]/so*100)+'%';bar.appendChild(i);r.appendChild(h);r.appendChild(bar);w.appendChild(r)});c.appendChild(w)}
 var l=$('list');l.textContent='';
 if(!m.length){l.appendChild(el('div','empty',(dm?(dstr===tdy?'Сегодня записей нет.':'В этот день записей нет.'):'В этом месяце записей нет.')+'\nНажмите «Добавить», чтобы внести первую.'));l.firstChild.style.whiteSpace='pre-line';return}
 var cur=null,grp=null;
 m.forEach(function(t){
  if(t.date!==cur){cur=t.date;
   var tot=m.filter(function(x){return x.date===cur}).reduce(function(s,x){return s+(x.type==='in'?x.amount:-x.amount)},0);
   var d=el('div','day');d.appendChild(el('span',null,dl(cur)));d.appendChild(el('span',null,(tot>0?'+':tot<0?'−':'')+money(Math.abs(tot))));
   l.appendChild(d);grp=el('div','group');l.appendChild(grp)}
  var r=el('button','row'),tt=el('div','t'),n=el('div',null,t.cat);tt.appendChild(n);var ci=icEl('ci',t.cat);
  if(t.note)tt.appendChild(el('small',null,t.note));
  r.appendChild(ci);r.appendChild(tt);r.appendChild(el('div','a '+t.type,(t.type==='in'?'+':'−')+money(t.amount)));
  if(t.id===lastId)r.classList.add('new');r.onclick=function(){openForm(t)};grp.appendChild(r)});lastId=null;
}

function setType(t){form.type=t;$('tout').classList.toggle('on',t==='out');$('tin').classList.toggle('on',t==='in');thumb($('tout').parentNode);
 if(CATS[t].indexOf(form.cat)<0)form.cat=CATS[t][0];drawChips()}
function drawChips(){var c=$('chips');c.textContent='';CATS[form.type].forEach(function(k){var b=el('button',k===form.cat?'on':'');b.appendChild(icEl('si',k));b.appendChild(document.createTextNode(k));b.type='button';b.onclick=function(){form.cat=k;drawChips()};c.appendChild(b)})}
function openForm(t){
 form.id=t?t.id:null;form.cat=t?t.cat:'';
 $('amount').value=t?String(t.amount).replace('.',','):'';$('note').value=t?t.note||'':'';$('date').value=t?t.date:(tab==='ops'&&mode==='day'?iso(dayView):iso(new Date()));
 $('del').style.display=t?'block':'none';setType(t?t.type:'out');$('v1').classList.add('on');
 if(!t)setTimeout(function(){$('amount').focus()},120)}
function closeAll(){document.querySelectorAll('.veil').forEach(function(v){v.classList.remove('on')});document.activeElement&&document.activeElement.blur()}
function saveForm(){
 var a=parseFloat($('amount').value.replace(/\s/g,'').replace(',','.'));
 if(!(a>0)){toast('Введите сумму');$('amount').focus();return}
 var d=$('date').value||iso(new Date());
 var rec={id:form.id||uid(),type:form.type,amount:Math.round(a*100)/100,cat:form.cat,note:$('note').value.trim(),date:d};
 if(form.id){tx=tx.map(function(t){return t.id===form.id?rec:t})}else tx.push(rec);lastId=rec.id;
 store();closeAll();
 var dd=new Date(d+'T00:00:00');view=new Date(dd.getFullYear(),dd.getMonth(),1);dayView=dd;render();toast('Сохранено')}

function payload(){return JSON.stringify({app:'budget',version:3,exported:new Date().toISOString(),transactions:tx,installments:inst,start:startBal},null,1)}
function importData(txt){
 try{var o=JSON.parse(txt),arr=Array.isArray(o)?o:(o.transactions||[]);if(!Array.isArray(arr))throw 0;
  var ids={};tx.forEach(function(t){ids[t.id]=1});var n=0;
  arr.forEach(function(t){
   if(!t||(t.type!=='in'&&t.type!=='out')||!(+t.amount>0)||!/^\d{4}-\d{2}-\d{2}$/.test(t.date))return;
   var id=t.id&&!ids[t.id]?String(t.id):(t.id&&ids[t.id]?null:uid());if(!id)return;ids[id]=1;
   tx.push({id:id,type:t.type,amount:+t.amount,cat:String(t.cat||'Другое'),note:String(t.note||''),date:t.date});n++});
  var ni=0,iids={};inst.forEach(function(i){iids[i.id]=1});
  (Array.isArray(o.installments)?o.installments:[]).forEach(function(i){if(!i||!i.id||iids[i.id]||!i.name||!(+i.total>0)||!(+i.months>=1)||!/^\d{4}-\d{2}-\d{2}$/.test(i.start))return;iids[i.id]=1;var mo=Math.floor(+i.months);inst.push({id:String(i.id),name:String(i.name),total:+i.total,months:mo,kind:i.kind==='loan'?'loan':'inst',rate:+i.rate||0,pay:+i.pay||0,start:i.start,paid:Math.min(Math.max(0,Math.floor(+i.paid||0)),mo),txs:Array.isArray(i.txs)?i.txs:[]});ni++});
  if(typeof o.start==='number'&&startBal===0){startBal=o.start;storeS()}
  store();storeI();render();closeAll();toast(n+ni?'Загружено записей: '+(n+ni):'Новых записей нет')}
 catch(e){toast('Не удалось прочитать данные')}}

$('prev').onclick=function(){step(-1)};
$('next').onclick=function(){step(1)};
$('add').onclick=function(){if(tab==='inst')openI(null);else openForm(null)};
$('menu').onclick=function(){$('paste').value='';$('v2').classList.add('on')};
$('tout').onclick=function(){setType('out')};$('tin').onclick=function(){setType('in')};
$('save').onclick=saveForm;
$('del').onclick=function(){if(confirm('Удалить эту запись?')){tx=tx.filter(function(t){return t.id!==form.id});store();closeAll();render()}};
document.querySelectorAll('[data-close]').forEach(function(b){b.onclick=closeAll});
document.querySelectorAll('.veil').forEach(function(v){v.addEventListener('click',function(e){if(e.target===v)closeAll()})});
$('amount').addEventListener('keydown',function(e){if(e.key==='Enter')saveForm()});

$('exp').onclick=function(){
 var name='budget-'+iso(new Date())+'.json';
 try{var bl=new Blob([payload()],{type:'application/json'}),u=URL.createObjectURL(bl),a=document.createElement('a');
  a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(u)},4000);toast('Файл скачан')}
 catch(e){fallbackCopy()}};
function fallbackCopy(){copyText(true)}
function copyText(auto){
 var t=payload();
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){toast(auto?'Скачать нельзя — данные скопированы':'Скопировано')}).catch(manual)}else manual();
 function manual(){var a=$('paste');a.value=t;a.focus();a.select();toast('Скопируйте текст из поля')}}
$('copy').onclick=function(){copyText(false)};
$('impf').onclick=function(){$('file').click()};
$('file').onchange=function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(){importData(r.result)};r.readAsText(f);this.value=''};
$('impt').onclick=function(){var v=$('paste').value.trim();if(!v){toast('Вставьте данные в поле');return}importData(v)};
$('wipe').onclick=function(){if(tx.length&&confirm('Удалить все записи? Это нельзя отменить. Сначала скачайте копию.')){tx=[];inst=[];startBal=0;storeS();store();storeI();render();closeAll()}};

var IKEY='budget.inst.v1',inst=[],iid=null,tab='ops';
function loadI(){try{var r=localStorage.getItem(IKEY);inst=r?JSON.parse(r):[];if(!Array.isArray(inst))inst=[]}catch(e){inst=[]}}
function storeI(){try{localStorage.setItem(IKEY,JSON.stringify(inst))}catch(e){toast('Не удалось сохранить')}}
function addM(s,n){var d=new Date(s+'T00:00:00'),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return iso(d)}
function mon(i){
 if(i.kind==='loan'){
  if(i.pay>0)return Math.round(i.pay*100)/100;
  if(i.rate>0){var r=i.rate/1200;return Math.round(i.total*r/(1-Math.pow(1+r,-i.months))*100)/100}}
 return Math.round(i.total/i.months*100)/100}
function totalPay(i){return i.kind==='loan'?Math.round(mon(i)*i.months*100)/100:i.total}
function over(i){return Math.max(0,Math.round((totalPay(i)-i.total)*100)/100)}
function rem(i){return i.paid>=i.months?0:Math.max(0,Math.round((totalPay(i)-i.paid*mon(i))*100)/100)}
function findI(id){return inst.filter(function(x){return x.id===id})[0]}
function bx(l,v,c){var b=el('div','box');b.appendChild(el('small',null,l));b.appendChild(el('strong',c||'',v));return b}
function dl2(s){var d=new Date(s+'T00:00:00');return d.getDate()+' '+GEN[d.getMonth()]+(d.getFullYear()!==new Date().getFullYear()?' '+d.getFullYear():'')}
function pct(n,t){return t>0?Math.min(100,n/t*100)+'%':'0%'}

function renderInst(){
 var c=$('pInst');c.textContent='';
 var act=inst.filter(function(i){return i.paid<i.months});
 var pr=el('div','pair');
 pr.appendChild(bx('Платежей в месяц',money(act.reduce(function(s,i){return s+mon(i)},0)),'out'));
 pr.appendChild(bx('Осталось выплатить',money(act.reduce(function(s,i){return s+rem(i)},0)),''));
 c.appendChild(pr);var ov=inst.reduce(function(s,i){return s+over(i)},0);if(ov>0){pr.style.marginBottom='10px';var ob=bx('Переплата по кредитам, всего',money(ov),'out');ob.style.marginBottom='22px';c.appendChild(ob)}
 if(!inst.length){var e=el('div','empty','Рассрочек и кредитов пока нет.\nНажмите «+ Рассрочка / кредит», и приложение посчитает платёж, остаток и переплату.');e.style.whiteSpace='pre-line';c.appendChild(e);return}
 var today=iso(new Date());
 inst.forEach(function(i){
  var card=el('div','box icard'),h=el('button','ih');h.type='button';
  h.appendChild(el('span',null,i.name));h.appendChild(el('span',null,money(mon(i))+' / мес'));
  h.onclick=function(){openI(i)};card.appendChild(h);
  var bar=el('div','bar'),f=el('i');f.style.width=pct(i.paid,i.months);f.style.background='var(--in)';bar.appendChild(f);card.appendChild(bar);
  card.appendChild(el('div','im','Оплачено '+i.paid+' из '+i.months+', осталось '+money(rem(i))));
  card.appendChild(el('div','im',(i.kind==='loan'?'Кредит':'Рассрочка')+(i.rate>0?', '+i.rate+'% годовых':'')+(over(i)>0?'. Переплата '+money(over(i))+' ('+Math.round(over(i)/i.total*100)+'%)':'')));
  if(i.paid>=i.months){card.appendChild(el('div','im in','Рассрочка погашена'))}
  else{
   var nd=addM(i.start,i.paid),late=nd<=today;
   
   var p=el('button','pay','Внести платёж');p.type='button';p.onclick=function(){payI(i.id)};card.appendChild(p)}
  c.appendChild(card)})}

function payI(id){var i=findI(id);if(!i||i.paid>=i.months)return;
 var a=i.paid>=i.months-1?rem(i):mon(i),t={id:uid(),type:'out',amount:a,cat:i.kind==='loan'?'Кредит':'Рассрочка',note:i.name+' ('+(i.paid+1)+'/'+i.months+')',date:iso(new Date())};
 tx.push(t);lastId=t.id;i.txs=(i.txs||[]).concat(t.id);i.paid++;store();storeI();render();toast('Платёж записан в расходы')}
var ikind='inst';
function num(id){return parseFloat($(id).value.replace(/\s/g,'').replace(',','.'))}
function setKind(k){ikind=k;document.querySelectorAll('#kindSeg button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-kind')===k)});thumb($('kindSeg'));
 $('loanF').style.display=k==='loan'?'':'none';$('itotal').placeholder=k==='loan'?'Сумма кредита':'Общая сумма';calcI()}
function calcI(){var t={kind:ikind,total:num('itotal'),months:parseInt($('imonths').value,10),rate:num('irate')||0,pay:ikind==='loan'?(num('ipay')||0):0};
 if(!(t.total>0&&t.months>0)){$('icalc').textContent='';return}
 var s='Платёж в месяц: '+money(mon(t));
 if(over(t)>0)s+='\nВсего выплатите: '+money(totalPay(t))+'\nПереплата: '+money(over(t))+' ('+Math.round(over(t)/t.total*100)+'%)';
 $('icalc').textContent=s}
function openI(i){iid=i?i.id:null;$('ititle').textContent=i?(i.kind==='loan'?'Кредит':'Рассрочка'):'Новая рассрочка или кредит';
 $('iname').value=i?i.name:'';$('itotal').value=i?String(i.total).replace('.',','):'';$('imonths').value=i?i.months:'';
 $('irate').value=i&&i.rate?String(i.rate).replace('.',','):'';$('ipay').value=i&&i.pay?String(i.pay).replace('.',','):'';
 $('idate').value=i?i.start:iso(new Date());$('ipaid').value=i?i.paid:'';
 $('idel').style.display=i?'block':'none';$('iundo').style.display=i&&i.txs&&i.txs.length?'block':'none';
 setKind(i&&i.kind==='loan'?'loan':'inst');$('v3').classList.add('on');
 if(!i)setTimeout(function(){$('iname').focus()},120)}
function saveI(){
 var name=$('iname').value.trim(),t=num('itotal'),m=parseInt($('imonths').value,10),pd=parseInt($('ipaid').value||'0',10),rate=num('irate')||0,pay=num('ipay')||0;
 if(!name){toast('Введите название');return}
 if(!(t>0)){toast('Введите сумму');return}
 if(!(m>=1)){toast('Укажите число месяцев');return}
 if(!(pd>=0&&pd<=m)){toast('Оплачено может быть от 0 до '+m);return}
 if(rate<0||rate>300){toast('Проверьте ставку');return}
 var ln=ikind==='loan',old=iid?findI(iid):null,rec={id:iid||uid(),kind:ikind,name:name,total:Math.round(t*100)/100,months:m,rate:ln?rate:0,pay:ln?Math.round(pay*100)/100:0,start:$('idate').value||iso(new Date()),paid:pd,txs:old&&old.txs?old.txs:[]};
 if(old)inst=inst.map(function(x){return x.id===iid?rec:x});else inst.push(rec);
 storeI();closeAll();render();toast('Сохранено')}
$('itotal').oninput=calcI;$('irate').oninput=calcI;$('ipay').oninput=calcI;document.querySelectorAll('#kindSeg button').forEach(function(b){b.onclick=function(){setKind(b.getAttribute('data-kind'))}});$('imonths').oninput=calcI;$('isave').onclick=saveI;
$('idel').onclick=function(){if(confirm('Удалить рассрочку? Уже записанные расходы останутся.')){inst=inst.filter(function(x){return x.id!==iid});storeI();closeAll();render()}};
$('iundo').onclick=function(){var i=findI(iid);if(!i||!i.txs||!i.txs.length)return;var tid=i.txs.pop();tx=tx.filter(function(t){return t.id!==tid});i.paid=Math.max(0,i.paid-1);store();storeI();closeAll();render();toast('Платёж отменён')};

function sums(y,m){var p=y+'-'+('0'+(m+1)).slice(-2),a=0,b=0,n=0;tx.forEach(function(t){if(t.date.indexOf(p)===0){n++;if(t.type==='in')a+=t.amount;else b+=t.amount}});return{i:a,o:b,n:a-b,c:n}}
function sg(v){return(v>0?'+':v<0?'−':'')+money(Math.abs(v))}
function cmp(name,d,goodUp){return el('div','im'+(d===0?'':((d>0)===goodUp?' in':' out')),name+': '+(d===0?'как в прошлом месяце':'на '+money(Math.abs(d))+(d>0?' больше':' меньше')+', чем в прошлом месяце'))}
function renderStat(){
 var c=$('pStat');c.textContent='';
 var y=view.getFullYear(),m=view.getMonth(),cur=sums(y,m),pd=new Date(y,m-1,1),pv=sums(pd.getFullYear(),pd.getMonth()),now=new Date();
 var pf=y+'-'+('0'+(m+1)).slice(-2),isCur=now.getFullYear()===y&&now.getMonth()===m;
 var hero=el('div','balance');hero.appendChild(el('small',null,'Итог за '+MONTHS[m].toLowerCase()+(isCur?' (текущий месяц)':'')));
 hero.appendChild(el('div','sum '+(cur.n>0?'in':cur.n<0?'out':''),sg(cur.n)));c.appendChild(hero);
 var p1=el('div','pair');p1.appendChild(bx('Расходы',cur.o?'−'+money(cur.o):money(0),'out'));p1.appendChild(bx('Доходы',cur.i?'+'+money(cur.i):money(0),'in'));c.appendChild(p1);
 var wdn=(now.getDay()+6)%7,ms=iso(new Date(now.getFullYear(),now.getMonth(),now.getDate()-wdn)),ts=iso(now),wk=0;
 tx.forEach(function(t){if(t.type==='out'&&t.date>=ms&&t.date<=ts)wk+=t.amount});
 var dim=new Date(y,m+1,0).getDate(),days=isCur?now.getDate():dim;
 var p2=el('div','pair');p2.appendChild(bx('Расходы за эту неделю',money(wk),'out'));p2.appendChild(bx('Расход в день',money(Math.round(cur.o/days)),''));c.appendChild(p2);
 if(pv.c){var cb=el('div','box');cb.style.marginBottom='22px';cb.appendChild(cmp('Расходы',cur.o-pv.o,false));cb.appendChild(cmp('Доходы',cur.i-pv.i,true));cb.firstChild.style.marginTop='0';c.appendChild(cb)}

 var hc=el('div','box');hc.style.marginBottom='22px';
 var sgm=el('div','seg');sgm.style.marginBottom='6px';sgm.appendChild(el('i','thumb'));
 var bw=el('button',statMode==='week'?'on':'','По неделям'),bm=el('button',statMode==='month'?'on':'','По месяцам');
 bw.type='button';bm.type='button';sgm.appendChild(bw);sgm.appendChild(bm);hc.appendChild(sgm);thumb(sgm);
 var ch=el('div','chart'),dt=el('div');hc.appendChild(ch);hc.appendChild(dt);
 bw.onclick=function(){statMode='week';bw.classList.add('on');bm.classList.remove('on');thumb(sgm);draw()};
 bm.onclick=function(){statMode='month';bm.classList.add('on');bw.classList.remove('on');thumb(sgm);draw()};
 function draw(){
  ch.textContent='';var cols=[],sel=0,H=120,mx=1;
  if(statMode==='week'){
   var ws=[],w0=null;
   for(var d=1;d<=dim;d++){var wx=(new Date(y,m,d).getDay()+6)%7;if(d===1||wx===0){w0={a:d,b:d,o:0,i:0};ws.push(w0)}w0.b=d}
   tx.forEach(function(t){if(t.date.indexOf(pf)===0){var dd=+t.date.slice(8,10);for(var q=0;q<ws.length;q++){if(dd>=ws[q].a&&dd<=ws[q].b){if(t.type==='in')ws[q].i+=t.amount;else ws[q].o+=t.amount;break}}}});
   ws.forEach(function(w,q){var lb=w.a===w.b?String(w.a):w.a+'–'+w.b;cols.push({l:lb,o:w.o,i:w.i,t:lb+' '+GEN[m]});
    if(isCur){if(now.getDate()>=w.a&&now.getDate()<=w.b)sel=q}else if(w.o>ws[sel].o)sel=q})
  }else{
   for(var k=5;k>=0;k--){var d2=new Date(y,m-k,1),s=sums(d2.getFullYear(),d2.getMonth());cols.push({l:MON3[d2.getMonth()],o:s.o,i:s.i,t:MONTHS[d2.getMonth()]+' '+d2.getFullYear()})}
   sel=cols.length-1}
  cols.forEach(function(x){mx=Math.max(mx,x.o,statMode==='month'?x.i:0)});
  var det=function(){
   dt.textContent='';var x=cols[sel],h=el('div',null,x.t);h.style.cssText='font-weight:600;margin-top:14px';dt.appendChild(h);
   var r=el('div','im sp');r.appendChild(el('span','out','Расходы '+(x.o?'−'+money(x.o):money(0))));r.appendChild(el('span','in','Доходы '+(x.i?'+'+money(x.i):money(0))));dt.appendChild(r)};
  cols.forEach(function(x,q){
   var col=el('button','col'+(q===sel?' sel':'')),bars=el('div','bars');col.type='button';
   (statMode==='month'?[[x.o,'var(--out)'],[x.i,'var(--in)']]:[[x.o,'var(--out)']]).forEach(function(p){
    var b=el('div','b');b.style.height=Math.max(3,Math.round(p[0]/mx*H))+'px';b.style.background=p[1];
    if(statMode==='week'&&p[0]>0)b.appendChild(el('span',null,kfmt(p[0])));bars.appendChild(b)});
   col.appendChild(bars);col.appendChild(el('div','lbl',x.l));
   col.onclick=function(){sel=q;ch.querySelectorAll('.col').forEach(function(e,j){e.classList.toggle('sel',j===q)});det()};
   ch.appendChild(col)});
  det()}
 draw();c.appendChild(hc);

 var byC={};
 tx.forEach(function(t){if(t.type==='out'&&t.date.indexOf(pf)===0)byC[t.cat]=(byC[t.cat]||0)+t.amount});
 var ks=Object.keys(byC).sort(function(a,b){return byC[b]-byC[a]});
 function pc(k){var v=byC[k]/cur.o*100;return v<1?'<1%':Math.round(v)+'%'}
 var h2=el('div','day');h2.appendChild(el('span',null,'Куда уходят деньги'));h2.appendChild(el('span',null,'доля от расходов'));c.appendChild(h2);
 if(!ks.length){var ne=el('div','box','Расходов в этом месяце нет');ne.style.cssText='color:var(--muted)';c.appendChild(ne)}
 else{
  var tp=el('div','box');tp.style.marginBottom='10px';tp.appendChild(el('small',null,'Больше всего потрачено на'));tp.appendChild(el('strong','out',ks[0]+': '+pc(ks[0])+' расходов'));c.appendChild(tp);
  var cw=el('div','cats');
  ks.forEach(function(k,ix){
   var r=el('div','cat'),h=el('div'),a=catName(k),b=el('span',null,pc(k));
   if(!ix)a.style.fontWeight='600';b.style.color='var(--ink)';b.style.fontWeight='600';
   h.appendChild(a);h.appendChild(b);r.appendChild(h);
   var bar=el('div','bar'),f=el('i');f.style.width=pct(byC[k],cur.o);bar.appendChild(f);r.appendChild(bar);
   r.appendChild(el('div','im',money(byC[k])));cw.appendChild(r)});
  c.appendChild(cw)}}

function updTab(){
 $('pOps').style.display=tab==='ops'?'':'none';$('pInst').style.display=tab==='inst'?'':'none';$('pStat').style.display=tab==='stat'?'':'none';
 $('add').style.display=tab==='stat'?'none':'';$('add').textContent=tab==='inst'?'+ Рассрочка / кредит':'+ Добавить';
 document.querySelector('.month').style.visibility=tab==='inst'?'hidden':'visible';
 document.querySelectorAll('#tabs button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-tab')===tab)});thumb($('tabs'));document.querySelectorAll('#modeSeg button').forEach(function(x){x.classList.toggle('on',x.getAttribute('data-mode')===mode)});thumb($('modeSeg'))}
function render(){renderOps();renderInst();renderStat();updTab()}
document.querySelectorAll('#tabs button').forEach(function(b){b.onclick=function(){tab=b.getAttribute('data-tab');render();window.scrollTo(0,0)}});


var cnt={},lastId=null;
function countTo(id,to,fmt){var e=$(id),from=cnt[id]==null?0:cnt[id];cnt[id]=to;cancelAnimationFrame(e._r);
 if(from===to||window.matchMedia('(prefers-reduced-motion:reduce)').matches){e.textContent=fmt(to);return}
 var t0=performance.now();(function f(t){var p=Math.min(1,(t-t0)/550),k=1-Math.pow(1-p,3);
  if(p<1){e.textContent=fmt(Math.round(from+(to-from)*k));e._r=requestAnimationFrame(f)}else e.textContent=fmt(to)})(t0)}
function thumb(seg){var i=0;seg.querySelectorAll('button').forEach(function(x,k){if(x.classList.contains('on'))i=k});seg.querySelector('.thumb').style.transform='translateX('+i*100+'%)'}
function bump(dir){var p=$(tab==='ops'?'pOps':tab==='stat'?'pStat':'pInst');p.classList.remove('sl','sr');void p.offsetWidth;p.classList.add(dir<0?'sl':'sr');setTimeout(function(){p.classList.remove('sl','sr')},450)}
document.querySelectorAll('.sheet').forEach(function(sh){
 var y0=null,dy=0;
 sh.addEventListener('touchstart',function(e){if(sh.scrollTop<=0&&e.touches.length===1){y0=e.touches[0].clientY;dy=0}},{passive:true});
 sh.addEventListener('touchmove',function(e){if(y0===null)return;dy=e.touches[0].clientY-y0;if(dy>0){sh.style.transition='none';sh.style.transform='translateY('+dy+'px)'}else dy=0},{passive:true});
 sh.addEventListener('touchend',function(){if(y0===null)return;y0=null;var close=dy>110;dy=0;sh.style.transition='';sh.style.transform='';if(close)closeAll()})});

var PATHS={
'Еда':'<path d="M7 3v7M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10"/><path d="M17 3c-2.2 1.2-3 3.6-3 6.5 0 1.8 1 3 3 3.5V21"/>',
'Транспорт':'<rect x="4.5" y="4" width="15" height="13" rx="3"/><path d="M4.5 12h15M8 20v-3M16 20v-3"/><circle cx="8.5" cy="14.5" r=".6"/><circle cx="15.5" cy="14.5" r=".6"/>',
'Дом':'<path d="M3.5 11 12 3.5 20.5 11M5.5 9.5V20h13V9.5M10 20v-5.5h4V20"/>',
'Здоровье':'<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"/>',
'Покупки':'<path d="M6 8h12l1 12H5zM9 8V7a3 3 0 0 1 6 0v1"/>',
'Развлечения':'<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M10.5 9.5v5l4-2.5z"/>',
'Рассрочка':'<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M6.5 15h4"/>',
'Другое':'<path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8"/>',
'Зарплата':'<rect x="3.5" y="8" width="17" height="11.5" rx="2"/><path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8M3.5 13h17"/>',
'Подработка':'<rect x="5" y="5.5" width="14" height="10" rx="1.5"/><path d="M3 19h18"/>',
'Подарок':'<rect x="4" y="10" width="16" height="10" rx="1.5"/><path d="M3 7h18v3H3zM12 7v13M12 7c-1.5-3.5-5-3-5-1 0 1.5 3 1 5 1zM12 7c1.5-3.5 5-3 5-1 0 1.5-3 1-5 1z"/>'};
PATHS['Кредит']='<path d="M5 19 19 5"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>';
function icEl(cls,k){var s=el('span',cls);s.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(PATHS[k]||PATHS['Другое'])+'</svg>';return s}
function catName(k){var s=el('span','nm');s.appendChild(icEl('si',k));s.appendChild(document.createTextNode(k));return s}
var MON3=['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'],statMode='week';
function kfmt(v){v=Math.round(v);if(v>=1e6)return(v/1e6).toFixed(1).replace('.0','')+'м';if(v>=1e4)return Math.round(v/1000)+'к';if(v>=1000)return(v/1000).toFixed(1).replace('.0','')+'к';return String(v)}
$('mtag').onclick=function(){var t0=today0(),m0=new Date(t0.getFullYear(),t0.getMonth(),1);
 if(tab==='ops'&&mode==='day'){if(dayView.getTime()===t0.getTime())return;var d1=dayView<t0?1:-1;dayView=t0;view=m0;render();bump(d1)}
 else{if(view.getTime()===m0.getTime())return;var d2=view<m0?1:-1;view=m0;render();bump(d2)}};

var mode='day',dayView=today0(),lastDay=iso(today0());
function today0(){var n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())}
function step(dir){
 if(tab==='ops'&&mode==='day'){dayView=new Date(dayView.getFullYear(),dayView.getMonth(),dayView.getDate()+dir);view=new Date(dayView.getFullYear(),dayView.getMonth(),1)}
 else view=new Date(view.getFullYear(),view.getMonth()+dir,1);
 render();bump(dir)}
function checkDay(){var t=iso(today0());if(t!==lastDay){lastDay=t;dayView=today0();view=new Date(dayView.getFullYear(),dayView.getMonth(),1);render()}}
document.addEventListener('visibilitychange',function(){if(!document.hidden)checkDay()});
window.addEventListener('pageshow',checkDay);setInterval(checkDay,60000);
document.querySelectorAll('#modeSeg button').forEach(function(b){b.onclick=function(){var nm=b.getAttribute('data-mode');if(nm===mode)return;
 if(nm==='day'){var t0=today0();dayView=(view.getFullYear()===t0.getFullYear()&&view.getMonth()===t0.getMonth())?t0:new Date(view.getFullYear(),view.getMonth(),1)}
 else view=new Date(dayView.getFullYear(),dayView.getMonth(),1);
 mode=nm;render()}});

var SKEY='budget.start.v1',startBal=0;
function loadS(){try{var r=localStorage.getItem(SKEY);startBal=r?(+JSON.parse(r)||0):0}catch(e){startBal=0}}
function storeS(){try{localStorage.setItem(SKEY,JSON.stringify(startBal))}catch(e){}}
function netNow(){var t=iso(new Date());return tx.reduce(function(s,x){return x.date<=t?s+(x.type==='in'?x.amount:-x.amount):s},0)}
function walletNow(){return Math.round((startBal+netNow())*100)/100}
function fm(v){return(v<0?'−':'')+money(Math.abs(v))}
$('bal').parentNode.onclick=function(){$('wval').value=String(walletNow()).replace('.',',');$('v4').classList.add('on');setTimeout(function(){$('wval').focus();$('wval').select()},200)};
$('wsave').onclick=function(){var v=parseFloat($('wval').value.replace(/\s/g,'').replace(',','.'));if(isNaN(v)){toast('Введите сумму');return}
 startBal=Math.round((v-netNow())*100)/100;storeS();closeAll();render();toast('Сохранено')};
loadS();loadI();load();render();
function guessCat(note,type){
 var n=(note||'').toLowerCase();
 if(type==='in')return /зарплат|salary|аванс/.test(n)?'Зарплата':'Другое';
 var map=[['Еда',/magnum|small|galmart|anvar|arbuz|mcdonald|kfc|burger|cafe|кафе|ресторан|pizza|coffee|starbucks|dodo|glovo|wolt|chocofood|bakery|пекарн|продукт|market|маркет|мясо|food/],
  ['Транспорт',/yandex go|yandex taxi|taxi|такси|indriver|bolt|onay|азс|azs|helios|sinooil|qazaq oil|shell|gazprom|парковк|parking|metro/],
  ['Здоровье',/аптек|apteka|pharm|europharma|sadykhan|клиник|clinic|медцентр|стомат/],
  ['Развлечения',/cinema|kinopark|кино|netflix|spotify|steam|playstation|youtube|apple\.com|ticket|билет/],
  ['Покупки',/wildberries|ozon|technodom|sulpak|mechta|zara|lcw|h&m|sportmaster|shop|магазин|kaspi магазин/],
  ['Дом',/kazakhtelecom|beeline|activ|tele2|altel|коммун|аренд|жкх|alser|energo|ремонт/]];
 for(var i=0;i<map.length;i++)if(map[i][1].test(n))return map[i][0];
 return 'Другое'}
(function(){try{
 var q=new URLSearchParams(location.search),raw=(q.get('amount')||'').replace(/[^\d.,]/g,'');
 if(!raw)return;
 raw=(/,/.test(raw)&&/\./.test(raw))?raw.replace(/,/g,''):raw.replace(',','.');
 var a=parseFloat(raw);if(!(a>0))return;
 var type=q.get('type')==='in'?'in':'out',note=(q.get('note')||'').trim().slice(0,80),cat=q.get('cat');
 if(!cat||CATS[type].indexOf(cat)<0)cat=guessCat(note,type);
 var ext=q.get('id'),id=ext?'x'+ext:uid(),dup=tx.some(function(t){return t.id===id});
 history.replaceState(null,'',location.pathname);
 if(dup){toast('Эта операция уже добавлена');return}
 var dq=q.get('date'),d=/^\d{4}-\d{2}-\d{2}$/.test(dq||'')?dq:iso(new Date());
 tx.push({id:id,type:type,amount:Math.round(a*100)/100,cat:cat,note:note,date:d});store();
 lastId=id;var dd=new Date(d+'T00:00:00');dayView=dd;view=new Date(dd.getFullYear(),dd.getMonth(),1);render();
 toast((type==='in'?'Доход ':'Расход ')+money(a)+' добавлен')}catch(e){}})();

})();
