

init = function(session,callback) {

    parsetabs(session,false,false)



    // Widget Synchronization : widget that share the same id will update each other
    // without sending any extra osc message

    $.each(__widgets__,function(i,widget) {
        if (widget.length>1) {
            var script =''

            var closureSync = function(x) {
                return function() {
                    var v = widget[x].getValue()
                    for (k=0;k<widget.length;k++) {
                        if (x!=k) {
                            widget[k].setValue(v,false,false)
                        }
                    }
                }
            }

            for (j in widget) {
                widget[j].on('sync',closureSync(j))
            }


        }
    })




    // Tabs...
    $('.tablist a').click(function(){

        var id = $(this).data('tab')
        $(id).siblings('.on').removeClass('on')
        $(id).addClass('on')
        $(this).parents('ul').find('.on').removeClass('on')
        $(this).addClass('on');$(this).parent().addClass('on')

    })




    // Activate first tabs
    $('.tablist li:first-child a').click()



    // reset zoom
    $(document).on('keydown.resetzoom', function(e){
        if (e.keyCode==96||e.keyCode==48) $('html').css('font-size',1)
    })



    // horizontal scrolling & zoom with mousewheel
    // if shift is pressed (native), or if there is no vertical scrollbar,
    //                               or if mouse is on h-scrollbar
    var scrollbarHeight = 10
    var contentPanels = $('.content')
    $('.tab').on('mousewheel',function(e) {
        // console.log(e)
        if (e.ctrlKey) {
            e.preventDefault()
            var d = -e.originalEvent.deltaY/Math.abs(e.originalEvent.deltaY)/10,
                s = d+parseFloat($('html').css('font-size'))
            $('html').css('font-size',s)
            contentPanels.css('top',60+'rem')

        } else {
            var h = $('#container').innerHeight()-scrollbarHeight-$(this).parents('.tab').length*5
            if ($(this).get(0).scrollHeight+scrollbarHeight == $(this).height()) {
                var scroll = e.originalEvent.deltaY || e.originalEvent.deltaX
                $(this).scrollLeft($(this).scrollLeft()+scroll)
                e.preventDefault()
            } else if (e.pageY>=h) {
                $(this).scrollLeft($(this).scrollLeft()+e.originalEvent.deltaY)
                e.preventDefault()
            }
        }
    })
    $('.panel').on('mousewheel',function(e) {
        if (!e.ctrlKey) {

            var h = $(this).parent().innerHeight()-scrollbarHeight-$(this).parents('.tab').length*5
            if ($(this).get(0).scrollHeight+scrollbarHeight == $(this).parent().height()) {
                var scroll = e.originalEvent.deltaY || e.originalEvent.deltaX
                $(this).scrollLeft($(this).scrollLeft()+scroll)
                e.preventDefault()
            }

        }
    })


    // sidepanel
    $('#container').append('\
        <a id="open-toggle">'+icon('navicon')+'</a>\
    ')


    $('#sidepanel').append(createMenu([
        {
            label:'Save',
            click:saveState,
            icon:'save'
        },
        {
            label:'Load',
            click:loadState,
            icon:'folder-open'
        },
        {
            label:'Load last state',
            click:loadLastState,
            icon:'history'
        },
        {
            label:'Send all',
            click:sendState,
            icon:'feed'

        },
        {
            label:'Fullscreen',
            click:function(){ipc.send('fullscreen')},
            icon:'tv'
        },
        {
            html:'<div class="inspector btn">\
                    Inspector\
                    <div class="result"><em>Click on a widges\'s label to inspect</em></div>\
                  </div>',
            icon:'terminal'
        }
    ]))


    $('#open-toggle').click(function(){
        $('#open-toggle, #sidepanel, #container').toggleClass('sidepanel-open')
    })

    $('.widget .label').click(function(){
        if (!$('#sidepanel').hasClass('sidepanel-open')){return}
        var data = String(JSON.stringify($(this).data('papers'),null,2)).split('\n').join('<br/>&nbsp;&nbsp;')
        $('.inspector .result').html(data)
    })

    // MASTER DRAGGING (wip)
    // $('body').drag(function(ev,dd){
    //     $(ev.target).trigger('draginit',[ev])
    // })


        if (callback) callback()

}
