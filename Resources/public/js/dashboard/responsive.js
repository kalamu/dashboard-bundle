$.widget( "kalamu.kalamuResponsiveConfig", {
    options: {
        datas: null
    },

    _create: function() {
        this.element.addClass('kalamu-responsive-config modal fade');
        this.element.append('<div class="modal-dialog"><div class="modal-content">\n\
                            <div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="'+Translator.trans('responsive_config.close', {}, 'kalamu')+'">\n\
                            <span aria-hidden="true">&times;</span></button><h4 class="modal-title"></h4></div><div class="modal-body">\n\
                            </div></div></div>');

        this.element.find('.modal-title').text(Translator.trans('responsive_config.title', {}, 'kalamu'));

        this.element.find('.modal-body').append('\
<table class="table text-center">\n\
    <thead>\n\
        <tr>\n\
            <th></th>\n\
            <th><i class="fa fa-desktop"></i> '+Translator.trans('responsive_config.desktop', {}, 'kalamu')+'</th>\n\
            <th><i class="fa fa-tablet"></i> '+Translator.trans('responsive_config.tablet', {}, 'kalamu')+'</th>\n\
            <th><i class="fa fa-mobile"></i> '+Translator.trans('responsive_config.mobile', {}, 'kalamu')+'</th>\n\
        </tr>\n\
    </thead>\n\
<tbody>\n\
    <tr>\n\
        <th>'+Translator.trans('responsive_config.visibility', {}, 'kalamu')+'</th>\n\
        <th><label class="btn btn-primary active"><input type="checkbox" name="visible" value="md" autocomplete="off" checked></label></th>\n\
        <th><label class="btn btn-primary active"><input type="checkbox" name="visible" value="sm" autocomplete="off" checked></label></th>\n\
        <th><label class="btn btn-primary active"><input type="checkbox" name="visible" value="xs" autocomplete="off" checked></label></th>\n\
    </tr>\n\
    <tr>\n\
        <th>'+Translator.trans('responsive_config.size', {}, 'kalamu')+'</th>\n\
        <th><input type="number" name="size-md" value="12" min="1" max="12" class="form-control text-center"></th>\n\
        <th><input type="number" name="size-sm" value="12" min="1" max="12" class="form-control text-center"></th>\n\
        <th><input type="number" name="size-xs" value="12" min="1" max="12" class="form-control text-center"></th>\n\
    </tr>\n\
    <tr>\n\
        <th>'+Translator.trans('responsive_config.class', {}, 'kalamu')+'</th>\n\
        <th colspan="3"><input type="text" name="class" class="form-control"></th>\n\
    </tr>\n\
</tbody>\n\
</table>\n\
<div class="text-right modal-footer"></div>\n\
');

        cancelLink = $('<a href="#" class="btn btn-default"><i class="fa fa-times"></i> '+Translator.trans('responsive_config.cancel', {}, 'kalamu')+'</a>');
        validLink = $('<a href="#" class="btn btn-success"><i class="fa fa-check"></i> '+Translator.trans('responsive_config.save', {}, 'kalamu')+'</a>');

        this.element.find('.modal-footer').append(cancelLink).append(validLink);

        this._on(cancelLink, {click: this.cancel});
        this._on(validLink, {click: this.valid});
        this._on(this.element.find('input[name="visible"]'), {change: this.changeVisibility});

        this.element.on('hidden.bs.modal', $.proxy(function(){
            this.element.trigger('kalamu.responsive_config.closed');
        }, this));


    },

    open: function(){
        this.element.modal('show');

        this.element.find('input[name="visible"]').each($.proxy(function(i, obj){
            if(this.visible.indexOf( $(obj).val() ) === -1){
                $(obj).prop('checked', false).trigger('change');
            }
        }, this.options.datas));

        this.element.find('input[name^="size-"]').each($.proxy(function(i, obj){
            $(obj).val( this.size[ $(obj).attr('name').substr(5) ] );
        }, this.options.datas));

        this.element.find('input[name="class"]').val(this.options.datas.class);
    },

    changeVisibility: function(e){
        $(e.target).parent().toggleClass('active btn-default btn-primary');
        this.element.find('input[name="size-'+$(e.target).val()+'"]').prop('disabled', !$(e.target).is(':checked'));
    },

    valid: function(e){
        e.preventDefault();
        var datas = {
            visible: $.makeArray( this.element.find('input[name="visible"]:checked').map(function(){ return $(this).val(); }) ),
            size: {},
            class: this.element.find('input[name="class"]').val()
        };

        this.element.find('input[name^="size-"]').map(function(){
            datas.size[$(this).attr('name').substr(5)] = $(this).val();
        });

        this.element.trigger('kalamu.responsive_config.change', datas);
        this.element.modal('hide');
    },

    cancel: function(e){
        e.preventDefault();
        this.element.modal('hide');
    }

});
