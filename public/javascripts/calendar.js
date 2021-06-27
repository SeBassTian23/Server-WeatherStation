var calendar = function(element, selected, marker, available){

    const zeroPad = (num, places) => String(num).padStart(places, '0');

    // empty container
    var el = document.querySelector(element);
    while(el.firstChild)
        el.removeChild(el.firstChild);

    // get Date
    var date = new Date();
    var current_date = new Date();
    var sel = [];
    if(selected !== undefined && selected != 'now'){
        sel = selected.split('-');
        if(sel.length == 3)
            date = new Date(Number(sel[0]),Number(sel[1])-1,Number(sel[2]));
        if(sel.length == 2)
            date = new Date(Number(sel[0]),Number(sel[1])-1);
        if(sel.length == 1)
            date = new Date(Number(sel[0]),current_date.getMonth());
    }

    // generate quick access links
    document.querySelector('#calendar-month').href = `/${current_date.getFullYear()}/${current_date.getMonth()+1}`;
    var yesterday = new Date( current_date.getFullYear(), current_date.getMonth()+1, current_date.getDate()-1 );
    document.querySelector('#calendar-yesterday').href = `/${yesterday.getFullYear()}/${yesterday.getMonth()}/${yesterday.getDate()}`;
    var week = new Date( current_date.getFullYear(), current_date.getMonth()+1, current_date.getDate()-7 );
    document.querySelector('#calendar-week').href = `/${week.getFullYear()}/${week.getMonth()}/${week.getDate()}`;

    if(available === undefined)
        available = [];

    available = available.sort();

    var year = date.getFullYear();
    var month = date.getMonth();
    var month_days = new Date(year, month+1, 0).getDate();
    var day = date.getDate();
    var weekday_offset = new Date(year,month,1).getDay();
    var weekdays = ['Sun', 'Mon', 'Tue', 'Wed','Thu','Fri','Sat'];
    var months = ['January', 'Febuary', 'March', 'April','May','June','July','August','September','October','November','December'];

    var previous = `${(month == 0)? (year-1) : year}-${(month == 0)? 12 : month}-${(month == 0)? 31 : new Date(year, month, 0).getDate()}`;
    var next = `${(month == 11)? (year+1) : year}-${(month == 11)? 1 : month+2}-${(month == 11)? 31 : new Date(year, month+2, 0).getDate()}`;

    var hasPrevious = false;
    var hasNext = false;

    if(available.length > 0 && available[0]){
        var prev = available[0].split('-');
        var prevdate = new Date(Number(prev[0]),Number(prev[1]),Number(prev[2])).valueOf();
        if(prevdate < date.valueOf())
            hasPrevious = true;
    }

    if(available.length > 0 && available[available.length-1]){
        var nex = available[available.length-1].split('-');
        var nextdate = new Date(Number(nex[0]),Number(nex[1])-1,Number(nex[2])).valueOf();
        if(nextdate > date.valueOf())
            hasNext = true;
    }

    if(selected == 'now'){
        marker = `${year}-${month+1}-${day}`;
    }

    // add navigation and month container
    var html = `
        <ul class="nav nav-pills nav-fill pb-2">
            <li class="nav-item text-start">
                <a href="#" class="previous bi bi-chevron-left" data-month="${previous}"></a>
            </li>
            <li class="nav-item">
                <a href="/${year}/${month+1}">${months[month]}</a> <a href="/${year}">${year}</a>
            </li>
            <li class="nav-item text-end">
                <a href="#" class="next bi bi-chevron-right" data-month="${next}"></a>
            </li>
        </ul>`;

    html += `<div class="col-12 small" id="calender-month">`;

        // add weekdays
        html += `<div class="row row-cols-7 text-center" id="cal-weekdays" style="border-bottom: 1px solid #e1e1e1;">`;
        for(var i in weekdays){
            html += `<div class="col" style="padding: 3px 0px;"><strong>${weekdays[i]}</strong></div>`;
        }
        html += `</div>`;

        // add weeks
        var days = 0;
        for(var d=0;d<6;d++){
            html += `<div class="row row-cols-7 text-center">`;
            for(var i=0;i<7;i++){
                if( (days == 0 && weekday_offset == i) || days > 0 && days < month_days ){
                    // if(days == day-1 && (selected == "now" || selected && sel.length > 2))
                    // console.log(selected, marker, `${year}-${month+1}-${days+1}`);
                    if( (days == day-1 && selected == "now") || ( sel.length > 2 && `${year}-${month+1}-${days+1}` == marker) )
                        html += `<div class="col" style="padding: 3px 0px;"><span class="bg-danger today">${days+1}</span></div>`;
                    else if(available.indexOf( `${year}-${zeroPad((month+1),2)}-${zeroPad((days+1),2)}` ) > -1 ){
                        if(`${year}-${month+1}-${days+1}` == `${current_date.getFullYear()}-${current_date.getMonth()+1}-${current_date.getDate()}`)
                            html += `<div class="col text-muted" style="padding: 3px 0px; font-weight:bold;"><a href="/">${days+1}</a></div>`;
                        else
                            html += `<div class="col text-muted" style="padding: 3px 0px; font-weight:bold;"><a href="/${year}/${month+1}/${days+1}">${days+1}</a></div>`;
                    }
                    else
                        html += `<div class="col text-muted" style="padding: 3px 0px;">${days+1}</div>`;
                    days++;
                }
                else
                    html += `<div class="col" style="padding: 3px 0px;"></div>`;
            }
            html += `</div>`;
            if( days >= month_days)
                break;
        }

    el.innerHTML = html;

    if(hasPrevious){
        el.querySelector('.previous').addEventListener('click', (e) => {
            e.preventDefault();
            calendar(element, e.srcElement.dataset.month, marker, available);
        }, {
            once: true
        });
    }
    else{
        var elPrev = el.querySelector('.previous')
        elPrev.setAttribute("disabled", "disabled");
        elPrev.classList.add("text-muted");
    }
    if(hasNext){
        el.querySelector('.next').addEventListener('click', (e) => {
            e.preventDefault();
            calendar(element, e.srcElement.dataset.month, marker, available);
        }, {
            once: true
        });
    }
    else{
        var elNext = el.querySelector('.next')
        elNext.setAttribute("disabled", "disabled");
        elNext.classList.add("text-muted");
    }
};
