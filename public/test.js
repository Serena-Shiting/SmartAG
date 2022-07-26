function goChart(timeArr, dataArr){

    time = document.getElementById("time").value;
    data = document.getElementById("data").value;
    name = document.getElementById("name").value;


    //get timeArr
    timeArr = []
    str = ""
    for(let i = 0; i < time.length; i++){

      if(time[i] != ","){
        str += time[i];
      }else{
        timeArr.push(str);
        str = ""
      }
    }

    //get dataArr
    dataArr = [];
    stri = "";
    for(let i = 0; i < data.length; i++){
      if(data[i] != ","){
        stri += data[i];
      }else{
        parseInt(stri);
        dataArr.push(stri);
        stri = ""
      }
    }


    // 声明所需变量
    var canvas,ctx;
    // 图表属性
    var cWidth, cHeight, cMargin, cSpace;
    var originX, originY;
    // 折线图属性
    var tobalDots, dotSpace, maxValue;
    var totalYNomber;
    // 运动相关变量
    var ctr, numctr, speed;

    // 获得canvas上下文
    canvas = document.getElementById("chart");
    if(canvas && canvas.getContext){
        ctx = canvas.getContext("2d");
    }
    initChart(); // 图表初始化
    drawLineLabelMarkers(); // 绘制图表轴、标签和标记
    drawLineAnimate(); // 绘制折线图的动画

    //点击刷新图表
    canvas.onclick = function(){
        initChart(); // 图表初始化
        drawLineLabelMarkers(); // 绘制图表轴、标签和标记
        drawLineAnimate(); // 绘制折线图的动画
    };

    // 图表初始化
    function initChart(){
        // 图表信息
        cMargin = 60;//表离y轴标题的距离
        cSpace = 80;//表离x轴标题的距离
        /*这里是对高清屏幕的处理，
             方法：先将canvas的width 和height设置成本来的两倍
             然后将style.height 和 style.width设置成本来的宽高
             这样相当于把两倍的东西缩放到原来的 1/2，这样在高清屏幕上 一个像素的位置就可以有两个像素的值
             这样需要注意的是所有的宽高间距，文字大小等都得设置成原来的两倍才可以。
        */
        canvas.width = Math.floor( (window.innerWidth-100)/2 ) * 2 ; //表的宽度
        canvas.height = 740; //表的高度
        canvas.style.height = canvas.height/2 + "px";
        canvas.style.width = canvas.width/2 + "px";
        cHeight = canvas.height - cMargin - cSpace;
        cWidth = canvas.width - cMargin - cSpace;
        originX = cMargin + cSpace;
        originY = cMargin + cHeight;

        // 折线图信息
        tobalDots = dataArr.length;
        dotSpace = parseInt( cWidth/tobalDots );
        maxValue = 0;
        for(var i=0; i<dataArr.length; i++){
            var dotVal = parseInt( dataArr[i] );
            if( dotVal > maxValue ){
                maxValue = dotVal;
            }
        }

        maxValue += (maxValue*1.1);//最大值加50

        totalYNomber = 10;
        // 运动相关
        ctr = 1;
        numctr = 100;
        speed = 6;

        ctx.translate(0.5,0.5);  // 当只绘制1像素的线的时候，坐标点需要偏移，这样才能画出1像素实线
    }

    // 绘制图表轴、标签和标记
    function drawLineLabelMarkers(){
        ctx.font = "24px Arial";
        ctx.lineWidth = 2;
        ctx.fillStyle = "#566a80";
        ctx.strokeStyle = "#566a80";
        // y轴
        drawLine(originX, originY, originX, cMargin);
        // x轴
        drawLine(originX, originY, originX+cWidth, originY);

        // 绘制标记
        drawMarkers();
    }

    // 画线的方法
    function drawLine(x, y, X, Y){
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(X, Y);
        ctx.stroke();
        ctx.closePath();
    }

    // 绘制标记
    function drawMarkers(){
        ctx.strokeStyle = "#E0E0E0";
        // 绘制 y 轴 及中间横线
        var oneVal = parseInt(maxValue/totalYNomber);
        ctx.textAlign = "right";
        for(var i=0; i<=totalYNomber; i++){
            var markerVal =  i*oneVal;
            var xMarker = originX-5;
            var yMarker = parseInt( cHeight*(1-markerVal/maxValue) ) + cMargin;

            ctx.fillText(markerVal, xMarker, yMarker+3, cSpace); // 文字
            if(i>0){
                drawLine(originX+2, yMarker, originX+cWidth, yMarker);
            }
        }
        // 绘制 x 轴 及中间竖线
        ctx.textAlign = "center";
        for(var i=0; i<tobalDots; i++){
            var markerVal = timeArr[i].substring(3, 5);
            var xMarker = originX+i*dotSpace;
            var yMarker = originY+30;
            ctx.fillText(markerVal+":00", xMarker, yMarker, cSpace); // 文字
            if(i>0){
                drawLine(xMarker, originY-2, xMarker, cMargin);
            }
        }
        // 绘制标题 y
        ctx.save();
        ctx.rotate(-Math.PI/2);
        ctx.fillText(name, -canvas.height/2, cSpace-10);
        ctx.restore();
        // 绘制标题 x
        ctx.fillText("Time", originX+cWidth/2, originY+cSpace/2+20);
    };

    //绘制折线图
    function drawLineAnimate(){
        ctx.strokeStyle = "#566a80";  //"#49FE79";

        //连线
        ctx.beginPath();
        for(var i=0; i<tobalDots; i++){
            var dotVal = dataArr[i];
            var barH = parseInt( cHeight*dotVal/maxValue* ctr/numctr );//
            var y = originY - barH;
            var x = originX + dotSpace*i;
            if(i==0){
                ctx.moveTo( x, y );
            }else{
                ctx.lineTo( x, y );
            }
        }
        ctx.stroke();

        //背景
        ctx.lineTo( originX+dotSpace*(tobalDots-1), originY);
        ctx.lineTo( originX, originY);
        //背景渐变色
        //柱状图渐变色
        var gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(133,171,212,0.6)');
        gradient.addColorStop(1, 'rgba(133,171,212,0.1)');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = "#566a80";

        //绘制点
        for(var i=0; i<tobalDots; i++){
            var dotVal = dataArr[i];
            var barH = parseInt( cHeight*dotVal/maxValue * ctr/numctr );
            var y = originY - barH;
            var x = originX + dotSpace*i;
            drawArc( x, y );  //绘制点
            ctx.fillText(parseInt(dotVal*ctr/numctr), x+15, y-8); // 文字
        }

        if(ctr<numctr){
            ctr++;
            setTimeout(function(){
                ctx.clearRect(0,0,canvas.width, canvas.height);
                drawLineLabelMarkers();
                drawLineAnimate();
            }, speed);
        }
    }

    //绘制圆点
    function drawArc( x, y, X, Y ){
        ctx.beginPath();
        ctx.arc( x, y, 3, 0, Math.PI*2 );
        ctx.fill();
        ctx.closePath();
    }

}
