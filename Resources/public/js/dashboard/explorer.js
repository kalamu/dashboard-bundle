$.widget( "kalamu.kalamuElementExplorer", {
    options: {
        element_api: null,              // Base API URL
        elements: null,                 // Elements from the API by categorie
        type: null,
        current_display: null,
        element_context: 'default',
        types_enabled: null,
        modalOptions: null,
        dashboard: null
    },

    _create: function() {
        this.element.addClass('kalamu-element-explorer modal fade');
        this.element.append('<div class="modal-dialog modal-lg"><div class="modal-content">\n\
                            <div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Fermer">\n\
                            <span aria-hidden="true">&times;</span></button><h4 class="modal-title"></h4></div><div class="modal-body">\n\
                            </div></div></div>');

        this.element.on('hide.bs.modal', $.proxy(function(){
            this.element.trigger('kalamu.dashboard.close_explorer');
            this.options.current_display = null;
        }, this));
    },
    
    /**
     * Show the list of elements by category
     * @returns {explorerAnonym$0}
     */
    showElements: function(){
        if(this.options.current_display === 'elements'){ return this; }
        this.element.find('.modal-title').text(Translator.trans('list.category.element', {}, 'kalamu'));
        this.element.find('.modal-body').html("<i class='fa fa-refresh fa-spin'></i> "+Translator.trans('loading', {}, 'kalamu'));

        this._loadElements($.proxy(this._renderElements, this));

        if(this.options.modalOptions){
            this.element.modal(this.options.modalOptions);
        }
        this.element.modal('show');
        this.options.current_display = 'elements';
    },

    /**
     * Load the list of elements and categories
     * @param {type} callback
     * @returns {Anonym$15}
     */
    _loadElements: function(callback){
        if(this.options.elements){
            callback();
            return this;
        }
        $.ajax({
            url: this.options.element_api+this.options.element_context+'/'+this.options.type,
            method: 'GET',
            dataType: 'json',
            context: this,
            success: $.proxy(function(callback, datas){
                this.options.elements = datas;
                callback();
            }, this, callback),
            error: $.proxy(function(){
                this.throwError("unknown.error");
            }, this)
        });
    },
    
    /**
     * Generate HTML for the loaded elements and categories
     * @returns {undefined}
     */
    _renderElements: function(){

        this.element.find('.modal-body')
                .html("<p>"+Translator.trans('select.element.in.list', {}, 'kalamu')+"</p>")
                .append('<div class="panel-group" role="tablist" id="element_selector" aria-multiselectable="true">');

        panelGroup = this.element.find('.modal-body .panel-group');
        $.each(this.options.elements, $.proxy(function(category, elements){
            panel = $('<div class="panel">');
            panel.append('<div class="panel-heading" role="tab" id="cat_heading_'+category+'">\n\
                        <a class="accordion-toggle accordion-icon link-unstyled collapsed" data-toggle="collapse" data-parent="#category_selector" href="#category_'+category+'" aria-expanded="false" aria-controls="category_'+category+'">\n\
                        '+Translator.trans('category.'+category, {}, 'kalamu')+'</a></div>');
            panel.append('<div id="category_'+category+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="cat_heading_'+category+'">\n\
                            <div class="panel-body"></div></div>');
            
            this.panelGroup.append( panel );
        }, {panelGroup: panelGroup}));

        this.element.find('.panel').one('show.bs.collapse', $.proxy(function(e){
            this.slideCategorie($(e.target).attr('id').replace('category_', ''));
        }, this));
    },
    
    /**
     * Show the list of element in the category
     * @param {string} category
     * @returns {undefined}
     */
    slideCategorie: function(category){
        this.showElements();
        
        $.each( $(this.options.elements).attr(category), $.proxy(function(name, label){
            link = $('<a href="#'+name+'"><span class="glyphicons glyphicons-more_windows"></span> '+label+'</a><br />');
            link.on('click', $.proxy(function(category, e){
                e.preventDefault();
                this.showElementInfos($(e.currentTarget).attr('href').substr(1), {}, category);
            }, this.root, this.category));
            this.panel.append(link);
        }, {
            root: this, 
            panel: this.element.find('#category_'+category+' .panel-body'),
            category: category
        }));
    },
    
    /**
     * Show details about the element
     * @param {type} identifier
     * @param {type} params
     * @param {type} category
     * @returns {undefined}
     */
    showElementInfos: function(identifier, params, category){
        category = category||this._findCategory(identifier);
        this.options.current_display = category+'.'+identifier;

        this.element.find('.modal-title').text( Translator.trans('element.details', {}, 'kalamu') );
        this.element.find('.modal-body').html("<i class='fa fa-refresh fa-spin'></i> "+Translator.trans('loading', {}, 'kalamu'));
        
        if(this.options.modalOptions){
            this.element.modal(this.options.modalOptions);
        }
        this.element.modal('show');

        this._loadElementInfos(identifier, params, $.proxy(this._renderElementInfos, this, identifier));
    },
    
    /**
     * Load details about an element
     * @param {type} identifier
     * @param {type} params
     * @param {type} callback
     * @returns {undefined}
     */
    _loadElementInfos: function(identifier, params, callback){
        request = {
            url: this.options.element_api+this.options.element_context+'/'+this.options.type+'/'+identifier+'/info',
            method: 'GET',
            dataType: 'json',
            context: this,
            success: $.proxy(function(identifier, callback, datas){
                callback(datas);
            }, this, identifier, callback),
            error: $.proxy(function(){
                this.throwError("unknown.error");
            }, this)
        };
        if(typeof params != 'undefined' && Object.keys(params).length){
            request.data = params;
            request.method = 'POST';
        }

        $.ajax(request);
    },
    
    /**
     * Generate HTML to show the details about an element
     * @param {type} identifier
     * @param {type} infos
     * @returns {undefined}
     */
    _renderElementInfos: function(identifier, infos){
        category = this._findCategory(identifier);
        backLink = $('<a href="#"><i class="fa fa-arrow-left"></i> '+Translator.trans('return.list', {}, 'kalamu')+'</a>');
        backLink.on('click', $.proxy(function(e){
            e.preventDefault();
            $.proxy(this.showElements(), this);
        }, this));

        this.element.find('.modal-body').html('').append(backLink);

        this.element.find('.modal-body').append('<span class="text-muted pull-right">'+Translator.trans('category', {}, 'kalamu')+' : <strong>'+Translator.trans('category.'+category, {}, 'kalamu')+'</strong></span>\n\
            <h1>'+infos.title+'</h1>\n\
            <div class="container-fluid">\n\
            <div class="row"><div class="col-md-12 elementDescription">'+infos.description+'</div></div>\n\
            <div class="row"><div class="col-md-12 elementForm modal-footer">'+infos.form+'</div></div>\n\
            </div>');
        this.element.find('.modal-body .elementForm form').on('submit', $.proxy(this._validParameters, this, identifier));
    },

    /**
     * Submit the form to valid parameters
     * @param {type} identifier
     * @param {type} e
     * @returns {undefined}
     */
    _validParameters: function(identifier, e){
        e.preventDefault();

        $.ajax({
            url: this.options.element_api+this.options.element_context+'/'+this.options.type+'/'+identifier+'/info',
            data: $(e.target).serializeArray(),
            method: 'POST',
            dataType: 'json',
            success: $.proxy(function(identifier, datas, ApiResponse){
                if(ApiResponse.form_valid){
                    this.element.trigger('kalamu.dashboard.valid_element', {type: this.options.type, identifier: identifier, params: datas});
                    this.element.modal('hide');
                }else{
                    this._renderElementInfos(identifier, ApiResponse);
                }
            }, this, identifier, $(e.target).serializeArray()),
            error: $.proxy(function(){
                this.throwError("unknown.error");
            }, this)
        });

    },
    
    _findCategory: function(identifier){
        categories = Object.keys(this.options.elements);
        for(x=0; x<categories.length; x++){
            if($(this.options.elements).attr( categories[x] ).hasOwnProperty(identifier)){
                return categories[x];
            }
        }
    },

    throwError: function(message){
        this.element.find('.modal-body').html("<div class='alert alert-danger'>"+Translator.trans(message, {}, 'kalamu')+"</div>");
    }

});
