(function(){
var KEY='budget.v1', CUR=' ₸';
var CATS={out:['Еда','Транспорт','Дом','Здоровье','Покупки','Развлечения','Рассрочка','Другое'],in:['Зарплата','Подработка','Подарок','Другое']};
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
 $('mlabel').textContent=MONTHS[view.getMonth()]+' '+view.getFullYear();
 var p=view.getFullYear()+'-'+('0'+(view.getMonth()+1)).slice(-2);
 var m=tx.filter(function(t){return t.date.indexOf(p)===0}).sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:(b.id>a.id?1:-1)});
 var si=0,so=0,byCat={};
 m.forEach(function(t){if(t.type==='in')si+=t.amount;else{so+=t.amount;byCat[t.cat]=(byCat[t.cat]||0)+t.amount}});
 var b=si-so;
 var all=tx.reduce(function(s,t){return s+(t.type==='in'?t.amount:-t.amount)},0),nw=new Date(),isCM=nw.getFullYear()===view.getFullYear()&&nw.getMonth()===view.getMonth();
 countTo('bal',all,sg);
 $('msub').textContent=(isCM?'В этом месяце':MONTHS[view.getMonth()]+' '+view.getFullYear())+': '+sg(b);
 $('mtag').textContent=isCM?'Текущий месяц':'К текущему месяцу';$('mtag').className='mtag'+(isCM?'':' go');
 $('bal').className='sum '+(all>0?'in':all<0?'out':'');
 countTo('sin',si,money);countTo('sout',so,money);
 var c=$('cats');c.textContent='';
 var keys=Object.keys(byCat).sort(function(a,b){return byCat[b]-byCat[a]});
 if(keys.length){var w=el('div','cats');keys.forEach(function(k){var r=el('div','cat'),h=el('div');h.appendChild(el('span',null,ic(k)+' '+k));h.appendChild(el('span',null,money(byCat[k])+' ('+Math.round(byCat[k]/so*100)+'%)'));var bar=el('div','bar'),i=el('i');i.style.width=Math.max(3,byCat[k]/so*100)+'%';bar.appendChild(i);r.appendChild(h);r.appendChild(bar);w.appendChild(r)});c.appendChild(w)}
 var l=$('list');l.textContent='';
 if(!m.length){l.appendChild(el('div','empty','В этом месяце записей нет.\nНажмите «Добавить», чтобы внести первую.'));l.firstChild.style.whiteSpace='pre-line';return}
 var cur=null,grp=null;
 m.forEach(function(t){
  if(t.date!==cur){cur=t.date;
   var tot=m.filter(function(x){return x.date===cur}).reduce(function(s,x){return s+(x.type==='in'?x.amount:-x.amount)},0);
   var d=el('div','day');d.appendChild(el('span',null,dl(cur)));d.appendChild(el('span',null,(tot>0?'+':tot<0?'−':'')+money(Math.abs(tot))));
   l.appendChild(d);grp=el('div','group');l.appendChild(grp)}
  var r=el('button','row'),tt=el('div','t'),n=el('div',null,t.cat);tt.appendChild(n);var ci=el('span','ci',ic(t.cat));
  if(t.note)tt.appendChild(el('small',null,t.note));
  r.appendChild(ci);r.appendChild(tt);r.appendChild(el('div','a '+t.type,(t.type==='in'?'+':'−')+money(t.amount)));
  if(t.id===lastId)r.classList.add('new');r.onclick=function(){openForm(t)};grp.appendChild(r)});lastId=null;
}

function setType(t){form.type=t;$('tout').classList.toggle('on',t==='out');$('tin').classList.toggle('on',t==='in');thumb($('tout').parentNode);
 if(CATS[t].indexOf(form.cat)<0)form.cat=CATS[t][0];drawChips()}
function drawChips(){var c=$('chips');c.textContent='';CATS[form.type].forEach(function(k){var b=el('button',k===form.cat?'on':'',ic(k)+' '+k);b.type='button';b.onclick=function(){form.cat=k;drawChips()};c.appendChild(b)})}
function openForm(t){
 form.id=t?t.id:null;form.cat=t?t.cat:'';
 $('amount').value=t?String(t.amount).replace('.',','):'';$('note').value=t?t.note||'':'';$('date').value=t?t.date:iso(new Date());
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
 var dd=new Date(d+'T00:00:00');view=new Date(dd.getFullYear(),dd.getMonth(),1);render();toast('Сохранено')}

function payload(){return JSON.stringify({app:'budget',version:2,exported:new Date().toISOString(),transactions:tx,installments:inst},null,1)}
function importData(txt){
 try{var o=JSON.parse(txt),arr=Array.isArray(o)?o:(o.transactions||[]);if(!Array.isArray(arr))throw 0;
  var ids={};tx.forEach(function(t){ids[t.id]=1});var n=0;
  arr.forEach(function(t){
   if(!t||(t.type!=='in'&&t.type!=='out')||!(+t.amount>0)||!/^\d{4}-\d{2}-\d{2}$/.test(t.date))return;
   var id=t.id&&!ids[t.id]?String(t.id):(t.id&&ids[t.id]?null:uid());if(!id)return;ids[id]=1;
   tx.push({id:id,type:t.type,amount:+t.amount,cat:String(t.cat||'Другое'),note:String(t.note||''),date:t.date});n++});
  var ni=0,iids={};inst.forEach(function(i){iids[i.id]=1});
  (Array.isArray(o.installments)?o.installments:[]).forEach(function(i){if(!i||!i.id||iids[i.id]||!i.name||!(+i.total>0)||!(+i.months>=1)||!/^\d{4}-\d{2}-\d{2}$/.test(i.start))return;iids[i.id]=1;var mo=Math.floor(+i.months);inst.push({id:String(i.id),name:String(i.name),total:+i.total,months:mo,start:i.start,paid:Math.min(Math.max(0,Math.floor(+i.paid||0)),mo),txs:Array.isArray(i.txs)?i.txs:[]});ni++});
  store();storeI();render();closeAll();toast(n+ni?'Загружено записей: '+(n+ni):'Новых записей нет')}
 catch(e){toast('Не удалось прочитать данные')}}

$('prev').onclick=function(){view=new Date(view.getFullYear(),view.getMonth()-1,1);render();bump(-1)};
$('next').onclick=function(){view=new Date(view.getFullYear(),view.getMonth()+1,1);render();bump(1)};
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
$('wipe').onclick=function(){if(tx.length&&confirm('Удалить все записи? Это нельзя отменить. Сначала скачайте копию.')){tx=[];inst=[];store();storeI();render();closeAll()}};

var IKEY='budget.inst.v1',inst=[],iid=null,tab='ops';
function loadI(){try{var r=localStorage.getItem(IKEY);inst=r?JSON.parse(r):[];if(!Array.isArray(inst))inst=[]}catch(e){inst=[]}}
function storeI(){try{localStorage.setItem(IKEY,JSON.stringify(inst))}catch(e){toast('Не удалось сохранить')}}
function addM(s,n){var d=new Date(s+'T00:00:00'),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return iso(d)}
function mon(i){return Math.round(i.total/i.months*100)/100}
function rem(i){return i.paid>=i.months?0:Math.max(0,Math.round((i.total-i.paid*mon(i))*100)/100)}
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
 c.appendChild(pr);
 if(!inst.length){var e=el('div','empty','Рассрочек пока нет.\nНажмите «+ Рассрочка», и приложение посчитает платёж и остаток.');e.style.whiteSpace='pre-line';c.appendChild(e);return}
 var today=iso(new Date());
 inst.forEach(function(i){
  var card=el('div','box icard'),h=el('button','ih');h.type='button';
  h.appendChild(el('span',null,i.name));h.appendChild(el('span',null,money(mon(i))+' / мес'));
  h.onclick=function(){openI(i)};card.appendChild(h);
  var bar=el('div','bar'),f=el('i');f.style.width=pct(i.paid,i.months);f.style.background='var(--in)';bar.appendChild(f);card.appendChild(bar);
  card.appendChild(el('div','im','Оплачено '+i.paid+' из '+i.months+', осталось '+money(rem(i))));
  if(i.paid>=i.months){card.appendChild(el('div','im in','Рассрочка погашена'))}
  else{
   var nd=addM(i.start,i.paid),late=nd<=today;
   card.appendChild(el('div','im'+(late?' out':''),(late?'Пора платить: ':'Следующий платёж: ')+dl2(nd)+', '+money(i.paid>=i.months-1?rem(i):mon(i))));
   var p=el('button','pay','Внести платёж');p.type='button';p.onclick=function(){payI(i.id)};card.appendChild(p)}
  c.appendChild(card)})}

function payI(id){var i=findI(id);if(!i||i.paid>=i.months)return;
 var a=i.paid>=i.months-1?rem(i):mon(i),t={id:uid(),type:'out',amount:a,cat:'Рассрочка',note:i.name+' ('+(i.paid+1)+'/'+i.months+')',date:iso(new Date())};
 tx.push(t);lastId=t.id;i.txs=(i.txs||[]).concat(t.id);i.paid++;store();storeI();render();toast('Платёж записан в расходы')}
function calcI(){var t=parseFloat($('itotal').value.replace(/\s/g,'').replace(',','.')),m=parseInt($('imonths').value,10);$('icalc').textContent=t>0&&m>0?'Платёж в месяц: '+money(Math.round(t/m*100)/100):''}
function openI(i){iid=i?i.id:null;$('ititle').textContent=i?'Рассрочка':'Новая рассрочка';
 $('iname').value=i?i.name:'';$('itotal').value=i?String(i.total).replace('.',','):'';$('imonths').value=i?i.months:'';$('idate').value=i?i.start:iso(new Date());$('ipaid').value=i?i.paid:'';
 $('idel').style.display=i?'block':'none';$('iundo').style.display=i&&i.txs&&i.txs.length?'block':'none';calcI();$('v3').classList.add('on');
 if(!i)setTimeout(function(){$('iname').focus()},120)}
function saveI(){
 var name=$('iname').value.trim(),t=parseFloat($('itotal').value.replace(/\s/g,'').replace(',','.')),m=parseInt($('imonths').value,10),pd=parseInt($('ipaid').value||'0',10);
 if(!name){toast('Введите название');return}
 if(!(t>0)){toast('Введите общую сумму');return}
 if(!(m>=1)){toast('Укажите число месяцев');return}
 if(!(pd>=0&&pd<=m)){toast('Оплачено может быть от 0 до '+m);return}
 var old=iid?findI(iid):null,rec={id:iid||uid(),name:name,total:Math.round(t*100)/100,months:m,start:$('idate').value||iso(new Date()),paid:pd,txs:old&&old.txs?old.txs:[]};
 if(old)inst=inst.map(function(x){return x.id===iid?rec:x});else inst.push(rec);
 storeI();closeAll();render();toast('Сохранено')}
$('itotal').oninput=calcI;$('imonths').oninput=calcI;$('isave').onclick=saveI;
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
  var tp=el('div','box');tp.style.marginBottom='10px';tp.appendChild(el('small',null,'Больше всего потрачено на'));tp.appendChild(el('strong','out',ic(ks[0])+' '+ks[0]+': '+pc(ks[0])+' расходов'));c.appendChild(tp);
  var cw=el('div','cats');
  ks.forEach(function(k,ix){
   var r=el('div','cat'),h=el('div'),a=el('span',null,ic(k)+' '+k),b=el('span',null,pc(k));
   if(!ix)a.style.fontWeight='600';b.style.color='var(--ink)';b.style.fontWeight='600';
   h.appendChild(a);h.appendChild(b);r.appendChild(h);
   var bar=el('div','bar'),f=el('i');f.style.width=pct(byC[k],cur.o);bar.appendChild(f);r.appendChild(bar);
   r.appendChild(el('div','im',money(byC[k])));cw.appendChild(r)});
  c.appendChild(cw)}}

function updTab(){
 $('pOps').style.display=tab==='ops'?'':'none';$('pInst').style.display=tab==='inst'?'':'none';$('pStat').style.display=tab==='stat'?'':'none';
 $('add').style.display=tab==='stat'?'none':'';$('add').textContent=tab==='inst'?'+ Рассрочка':'+ Добавить';
 document.querySelector('.month').style.visibility=tab==='inst'?'hidden':'visible';
 document.querySelectorAll('#tabs button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-tab')===tab)});thumb($('tabs'))}
function render(){renderOps();renderInst();renderStat();updTab()}
document.querySelectorAll('#tabs button').forEach(function(b){b.onclick=function(){tab=b.getAttribute('data-tab');updTab();window.scrollTo(0,0)}});


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

var ICO={'Еда':'🍔','Транспорт':'🚌','Дом':'🏠','Здоровье':'💊','Покупки':'🛍️','Развлечения':'🎬','Рассрочка':'💳','Другое':'📦','Зарплата':'💼','Подработка':'💻','Подарок':'🎁'};
var MON3=['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'],statMode='week';
function ic(k){return ICO[k]||'📦'}
function kfmt(v){v=Math.round(v);if(v>=1e6)return(v/1e6).toFixed(1).replace('.0','')+'м';if(v>=1e4)return Math.round(v/1000)+'к';if(v>=1000)return(v/1000).toFixed(1).replace('.0','')+'к';return String(v)}
$('mtag').onclick=function(){var n=new Date(),t0=new Date(n.getFullYear(),n.getMonth(),1);if(view.getTime()===t0.getTime())return;var dir=view<t0?1:-1;view=t0;render();bump(dir)};
loadI();load();render();
})();
