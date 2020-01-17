/* eslint-disable quotes, max-len */
/*
 * @Author: czy0729
 * @Date: 2019-09-01 14:32:36
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-01-17 14:24:50
 */
import { HOST_CDN } from '@constants/cdn'

const html = (kData, upColor, downColor) =>
  `<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale=1,user-scalable=no" /></head><style type="text/css">body{margin:0;padding:0;background:#0F1923}.Kline-div{position:fixed;width:100%;bottom:0rem;top:0}.Kline-div .K-line{height:100%;width:100%}</style><body><div id="Kline-div" class="Kline-div"><div id="k-content" class="K-line"></div></div><script src="${HOST_CDN}/npm/jquery@3.3.1/dist/jquery.min.js"></script><script src="${HOST_CDN}/npm/echarts@4.2.1/dist/echarts.min.js"></script><script>var bgColor='#0F1923';var upColor='${upColor}';var downColor='${downColor}';var ma5Color='#39afe6';var ma10Color='#da6ee8';var ma20Color='#ffab42';var ma30Color='#00940b';function addTimeStr(time,num){var hour=time.split(':')[0];var mins=Number(time.split(':')[1]);var mins_un=parseInt((mins+num)/60);var hour_un=parseInt((Number(hour)+mins_un)/24);if(mins_un>0){if(hour_un>0){var tmpVal=((Number(hour)+mins_un)%24)+'';hour=tmpVal.length>1?tmpVal:'0'+tmpVal}else{var tmpVal=Number(hour)+mins_un+'';hour=tmpVal.length>1?tmpVal:'0'+tmpVal}var tmpMinsVal=((mins+num)%60)+'';mins=tmpMinsVal.length>1?tmpMinsVal:0+tmpMinsVal}else{var tmpMinsVal=mins+num+'';mins=tmpMinsVal.length>1?tmpMinsVal:'0'+tmpMinsVal}return hour+':'+mins}function getNextTime(startTime,endTIme,offset,resultArr){var result=addTimeStr(startTime,offset);resultArr.push(result);if(result==endTIme){return resultArr}else{return getNextTime(result,endTIme,offset,resultArr)}}var time_arr=function(type){if(type.indexOf('us')!=-1){var timeArr=new Array();timeArr.push('09:30');return getNextTime('09:30','16:00',1,timeArr)}if(type.indexOf('hs')!=-1){var timeArr=new Array();timeArr.push('09:30');timeArr.concat(getNextTime('09:30','11:29',1,timeArr));timeArr.push('13:00');timeArr.concat(getNextTime('13:00','15:00',1,timeArr));return timeArr}if(type.indexOf('hk')!=-1){var timeArr=new Array();timeArr.push('09:30');timeArr.concat(getNextTime('09:30','11:59',1,timeArr));timeArr.push('13:00');timeArr.concat(getNextTime('13:00','16:00',1,timeArr));return timeArr}};var get_m_data=function(m_data,type){var priceArr=new Array();var avgPrice=new Array();var vol=new Array();var times=time_arr(type);$.each(m_data.data,function(i,v){priceArr.push(v[1]);avgPrice.push(v[2]);vol.push(v[3])});return{priceArr:priceArr,avgPrice:avgPrice,vol:vol,times:times,}};function initMOption(m_data,type){var m_datas=get_m_data(m_data,type);return{tooltip:{trigger:'axis',axisPointer:{type:'cross',},formatter:function(params,ticket,callback){var i=params[0].dataIndex;var color;if(m_datas.priceArr[i]>m_data.yestclose){color='style="color:#ff4242"'}else{color='style="color:#26bf66"'}var html='<div class="commColor" style="width:100px;"><div>当前价<span  '+color+' >'+m_datas.priceArr[i]+'</span></div>';html+='<div>均价<span  '+color+' >'+m_datas.avgPrice[i]+'</span></div>';html+='<div>涨幅<span  '+color+' >'+ratioCalculate(m_datas.priceArr[i],m_data.yestclose)+'%</span></div>';html+='<div>成交量<span  '+color+' >'+m_datas.vol[i]+'</span></div></div>';return html},},legend:{icon:'rect',type:'scroll',itemWidth:14,itemHeight:2,left:0,top:'-1%',textStyle:{fontSize:12,color:'#0e99e2',},},axisPointer:{show:true,},color:[ma5Color,ma10Color],grid:[{id:'gd1',left:'0%',right:'1%',height:'67.5%',top:'5%',},{id:'gd2',left:'0%',right:'1%',height:'67.5%',top:'5%',},{id:'gd3',left:'0%',right:'1%',top:'75%',height:'19%',},],xAxis:[{gridIndex:0,data:m_datas.times,axisLabel:{show:false,},splitLine:{show:false,},},{show:false,gridIndex:1,data:m_datas.times,axisLabel:{show:false,},splitLine:{show:false,},},{splitNumber:2,type:'category',gridIndex:2,data:m_datas.times,axisLabel:{color:'#9b9da9',fontSize:10,},},],yAxis:[{gridIndex:0,scale:true,splitNumber:3,axisLabel:{inside:true,fontWeight:'bold',color:function(val){if(val==m_data.yestclose){return'#aaa'}return val>m_data.yestclose?upColor:downColor},},z:4,splitLine:{show:false,lineStyle:{color:'#181a23',},},},{scale:true,gridIndex:1,splitNumber:3,position:'right',z:4,axisLabel:{color:function(val){if(val==m_data.yestclose){return'#aaa'}return val>m_data.yestclose?upColor:downColor},inside:true,fontWeight:'bold',formatter:function(val){var resul=ratioCalculate(val,m_data.yestclose);return Number(resul).toFixed(2)+' %'},},splitLine:{show:false,lineStyle:{color:'#181a23',},},axisPointer:{show:true,label:{formatter:function(params){return ratioCalculate(params.value,m_data.yestclose)+'%'},},},},{gridIndex:2,z:4,splitNumber:3,axisLine:{onZero:false,},axisTick:{show:false,},splitLine:{show:false,},axisLabel:{color:'#c7c7c7',inside:true,fontSize:8,},},],dataZoom:[],backgroundColor:bgColor,blendMode:'source-over',series:[{name:'当前价',type:'line',data:m_datas.priceArr,smooth:true,symbol:'circle',lineStyle:{normal:{opacity:0.8,color:'#39afe6',width:1,},},areaStyle:{normal:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(0, 136, 212, 0.7)',},{offset:0.8,color:'rgba(0, 136, 212, 0.02)',},],false),shadowColor:'rgba(0, 0, 0, 0.1)',shadowBlur:10,},},},{name:'均价',type:'line',data:m_datas.avgPrice,smooth:true,symbol:'circle',lineStyle:{normal:{opacity:0.8,color:'#da6ee8',width:1,},},},{type:'line',data:m_datas.priceArr,smooth:true,symbol:'none',gridIndex:1,xAxisIndex:1,yAxisIndex:1,lineStyle:{normal:{width:0,},},},{name:'Volumn',type:'bar',gridIndex:2,xAxisIndex:2,yAxisIndex:2,data:m_datas.vol,barWidth:'60%',itemStyle:{normal:{color:function(params){var colorList;if(m_datas.priceArr[params.dataIndex]>m_datas.priceArr[params.dataIndex-1]){colorList=upColor}else{colorList=downColor}return colorList},},},},],}}function ratioCalculate(price,yclose){return(((price-yclose)/yclose)*100).toFixed(3)}function splitData(rawData){var datas=[];var times=[];var vols=[];for(var i=0;i<rawData.length;i++){datas.push(rawData[i]);times.push(rawData[i].splice(0,1)[0]);vols.push(rawData[i][4])}return{datas:datas,times:times,vols:vols}}function calculateMA(dayCount,data){var result=[];for(var i=0,len=data.times.length;i<len;i++){if(i<dayCount){result.push('-');continue}var sum=0;for(var j=0;j<dayCount;j++){sum+=data.datas[i-j][1]}result.push((sum/dayCount).toFixed(2))}return result}var calcEMA,calcDIF,calcDEA,calcMACD;calcEMA=function(n,data,field){var i,l,ema,a;a=2/(n+1);if(field){ema=[data[0][field]];for(i=1,l=data.length;i<l;i++){ema.push((a*data[i][field]+(1-a)*ema[i-1]).toFixed(2))}}else{ema=[data[0]];for(i=1,l=data.length;i<l;i++){ema.push((a*data[i]+(1-a)*ema[i-1]).toFixed(3))}}return ema};calcDIF=function(short,long,data,field){var i,l,dif,emaShort,emaLong;dif=[];emaShort=calcEMA(short,data,field);emaLong=calcEMA(long,data,field);for(i=0,l=data.length;i<l;i++){dif.push((emaShort[i]-emaLong[i]).toFixed(3))}return dif};calcDEA=function(mid,dif){return calcEMA(mid,dif)};calcMACD=function(short,long,mid,data,field){var i,l,dif,dea,macd,result;result={};macd=[];dif=calcDIF(short,long,data,field);dea=calcDEA(mid,dif);for(i=0,l=data.length;i<l;i++){macd.push(((dif[i]-dea[i])*2).toFixed(3))}result.dif=dif;result.dea=dea;result.macd=macd;return result};function initKOption(cdata){var data=splitData(cdata);var macd=calcMACD(12,26,9,data.datas,1);return{tooltip:{trigger:'axis',axisPointer:{type:'cross',},},legend:{icon:'rect',type:'scroll',itemWidth:14,itemHeight:2,left:0,top:'-1%',animation:true,textStyle:{fontSize:12,color:'#0e99e2',},pageIconColor:'#0e99e2',},axisPointer:{show:true,},color:[ma5Color,ma10Color,ma20Color,ma30Color],grid:[{id:'gd1',left:'0%',right:'1%',height:'60%',top:'5%',},{left:'0%',right:'1%',top:'66.5%',height:'10%',},{left:'0%',right:'1%',top:'80%',height:'14%',},],xAxis:[{type:'category',data:data.times,scale:true,boundaryGap:false,axisLine:{onZero:false,},axisLabel:{show:false,},splitLine:{show:false,lineStyle:{color:'#3a3a3e',},},splitNumber:20,min:'dataMin',max:'dataMax',},{type:'category',gridIndex:1,data:data.times,axisLabel:{color:'#9b9da9',fontSize:10,},},{type:'category',gridIndex:2,data:data.times,axisLabel:{show:false,},},],yAxis:[{scale:true,z:4,axisLabel:{color:'#c7c7c7',inside:true,},splitLine:{show:false,lineStyle:{color:'#181a23',},},},{gridIndex:1,splitNumber:3,z:4,axisLine:{onZero:false,},axisTick:{show:false,},splitLine:{show:false,},axisLabel:{color:'#c7c7c7',inside:true,fontSize:8,},},{z:4,gridIndex:2,splitNumber:4,axisLine:{onZero:false,},axisTick:{show:false,},splitLine:{show:false,},axisLabel:{color:'#c7c7c7',inside:true,fontSize:8,},},],dataZoom:[{type:'slider',xAxisIndex:[0,1,2],start:40,end:100,throttle:10,top:'94%',height:'6%',borderColor:'#696969',textStyle:{color:'#dcdcdc',},handleSize:'90%',handleIcon:'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',dataBackground:{lineStyle:{color:'#fff',},areaStyle:{color:'#696969',},},},],animation:false,backgroundColor:bgColor,blendMode:'source-over',series:[{name:'K线周期图表',type:'candlestick',data:data.datas,barWidth:'55%',large:true,largeThreshold:100,itemStyle:{normal:{color:upColor,color0:downColor,borderColor:upColor,borderColor0:downColor,},},},{name:'MA5',type:'line',data:calculateMA(5,data),smooth:true,symbol:'none',lineStyle:{normal:{opacity:0.8,color:'#39afe6',width:1,},},},{name:'MA10',type:'line',data:calculateMA(10,data),smooth:true,symbol:'none',lineStyle:{normal:{opacity:0.8,color:'#da6ee8',width:1,},},},{name:'MA20',type:'line',data:calculateMA(20,data),smooth:true,symbol:'none',lineStyle:{opacity:0.8,width:1,color:ma20Color,},},{name:'MA30',type:'line',data:calculateMA(30,data),smooth:true,symbol:'none',lineStyle:{normal:{opacity:0.8,width:1,color:ma30Color,},},},{name:'Volumn',type:'bar',xAxisIndex:1,yAxisIndex:1,data:data.vols,barWidth:'60%',itemStyle:{normal:{color:function(params){var colorList;if(data.datas[params.dataIndex][1]>data.datas[params.dataIndex][0]){colorList=upColor}else{colorList=downColor}return colorList},},},},{name:'MACD',type:'bar',xAxisIndex:2,yAxisIndex:2,data:macd.macd,barWidth:'40%',itemStyle:{normal:{color:function(params){var colorList;if(params.data>=0){colorList=upColor}else{colorList=downColor}return colorList},},},},{name:'DIF',type:'line',symbol:'none',xAxisIndex:2,yAxisIndex:2,data:macd.dif,lineStyle:{normal:{color:'#da6ee8',width:1,},},},{name:'DEA',type:'line',symbol:'none',xAxisIndex:2,yAxisIndex:2,data:macd.dea,lineStyle:{normal:{opacity:0.8,color:'#39afe6',width:1,},},},],}}</script><script>var kdata = ${kData};var kChart = echarts.init(document.getElementById('k-content'));kChart.setOption(initKOption(kdata));</script></body></html>`

export default html
