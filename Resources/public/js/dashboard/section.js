$.widget( "kalamu.kalamuDashboardSection", {

    options: {
        row: null,
        sections: null, // Liste des types de section
        section: null,   // Type de section sélectionné
        identifiant: null,
        current_display: null
    },

    _create: function() {

        this.element.addClass('row kalamu-dashboard-section');
        
        if(!this.options.identifiant){
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            this.options.identifiant = "";
            for (var i = 0, n = charset.length; i < 10; ++i) {
                this.options.identifiant += charset.charAt(Math.floor(Math.random() * n));
            }
        }
        
        config = $('<div class="section-config mb10"></div>');
        this.element.prepend(config);
        edit_link = $('<strong class="text-muted section-name"></strong> <a href="#" title="Modifier la section"><strong class="section-identifiant"></a></strong>');
        config.append(edit_link);
        edit_link.on('click', $.proxy(this.showEdit, this));
        
        generic_row = $('<div>');
        this.element.append(generic_row);
        generic_row.kalamuDashboardRow({
             enable_sections: false,
        });
        
        this.refresh();
        
    },
    
    refresh: function(){
        this.element.find('.section-config').attr('id', 'section-'+this.options.identifiant);
        this.element.find('.section-name').text( $(this.options.sections).attr( this.options.section )+' - ' );
        this.element.find('.section-identifiant').html('#' + this.options.identifiant + ' <i class="fa fa-gear"></i>');
    },
    
    // Affiche les options de configuration de la Section
    showEdit: function(e){
        e.preventDefault();
        
        this.options.current_display = $('<div class="modal fade">').append('<div class="modal-dialog"><div class="modal-content">\n\
                            <div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Fermer">\n\
                            <span aria-hidden="true">&times;</span></button><h4 class="modal-title"></h4></div><div class="modal-body">\n\
                            <div class="form-group"><label class="control-label required" for="section-identifiant">Identifiant de la section <span class="asterisk">*</span></label>\n\
                            <input type="text" class="form-control" required="required" name="section-identifiant" id="section-identifiant"></div>\n\
                            <div class="form-group"><label class="control-label required" for="section-type">Type de section <span class="asterisk">*</span></label>\n\
                            <select class="form-control" name="section-type" id="section-type"></select></div>\n\
                            <div class="form-group"><button class="btn btn-info"><i class="fa fa-check"></i> Enregistrer</button>\n\
                            <button class="btn btn-default"><i class="fa fa-times"></i> Annuler</button></div>\n\
                            </div></div></div>');
        
        this.options.current_display.appendTo('body');
        this.options.current_display.modal();
        
        this.options.current_display.find('.modal-title').text("Paramètres section : "+$(this.options.sections).attr( this.options.section ));
        this.options.current_display.find('#section-identifiant').val(this.options.identifiant);
        $.each(this.options.sections, $.proxy(function(name, label){
            this.append('<option value="'+name+'">'+label+'</option>');
        }, this.options.current_display.find('#section-type')));
        this.options.current_display.find('#section-type').val(this.options.section);
        
        this._on( this.options.current_display.find('.btn.btn-info'), {
            click: this.saveOptions
        });
        this._on( this.options.current_display.find('.btn.btn-default'), {
            click: this.hideEdit
        });
        
        
        this.options.current_display.on('hidden.bs.modal', $.proxy(function(){
            console.log("on ferme la modale");
            this.options.current_display.remove();
            this.options.current_display = null;
        }, this));
    },
    
    hideEdit: function(e){
        e.preventDefault();
        
        this.options.current_display.modal('hide');
    },
    
    saveOptions: function(e){
        e.preventDefault();
        
        this.options.identifiant = this.options.current_display.find('#section-identifiant').val();
        this.options.section = this.options.current_display.find('#section-type').val();
        
        this.hideEdit(e);
        this.refresh();
    },

    export: function(){
        var json = {
            col: this.options.col,
            cols: []
        };
        list_col = this.element.find('.kalamu-dashboard-col');
        for(var x=0; x<list_col.length; x++){
            json.cols.push( list_col.eq(x).kalamuDashboardCol('export') );
        }
        return json;
    },

    up: function(e){
        e.preventDefault();
        if(this.element.prev().not('.stick-top').length){
            this.element.prev().before( this.element.detach() );
            $(window).trigger("kalamu.row.move");
        }
    },

    down: function(e){
        e.preventDefault();
        if(this.element.next().not('.stick-bottom').length){
            this.element.next().after( this.element.detach() );
            $(window).trigger("kalamu.row.move");
        }
    },

    // Ajoute les colonnes demandées
    _addCols: function(){
        md = Math.abs(12/this.options.col);
        for(x=0; x<this.options.col; x++){
            col = $('<div>');
            this.element.append(col);
            resizable = (x+1) < this.options.col ? true : false;
            if(this.options.cols[x]){
                this.options.cols[x].resizable = resizable;
                col.kalamuDashboardCol(this.options.cols[x]);
            }else{
                col.kalamuDashboardCol({md: md, resizable: resizable})
            }

        }
    },

    // Ajoute la ligne générique
    _addGenericRow: function(){
        if(this.element.parents('.kalamu-dashboard').find('.kalamu-dashboard-generic-row').length){
            return ;
        }
        this.element.addClass('kalamu-dashboard-generic-row');

        links = $('<strong><i class="fa fa-plus"></i> Ajouter une ligne avec : </strong>');
        this.element.append(links);
        types = [1, 2, 3, 4];
        for(n =0; n<types.length; n++){
            col = types[n];

            link = $('<a href="#" data-nb-col="'+col+'"> '+(col>1 ? col+' colonnes' : col+' colonne')+'</a>')
                    .css('margin-left', '1em')
                    .on('click', $.proxy(this._addRow, this))
                    .appendTo(links);
        }
        
        if(this.options.enable_sections && this.options.sections){
            linkSection = $('<strong><i class="fa fa-plus"></i> Ajouter une section : </strong>');
            this.element.append('<br />').append(linkSection);
            $.each(this.options.sections ,$.proxy(function(name, label){
                
                link = $('<a href="#" data-section-type="'+name+'"> '+label+'</a>')
                    .css('margin-left', '1em')
                    .on('click', $.proxy(this.root._addSection, this.root))
                    .appendTo(this.linkSection);
                
            }, {root: this, linkSection: linkSection}));
        }
    },

    _addRow: function(e){
        e.preventDefault();
        nb_col = $(e.currentTarget).attr('data-nb-col');
        md = Math.abs(12/nb_col);
        new_row = $('<div>');
        this.element.before( new_row );
        new_row.kalamuDashboardRow({col: nb_col});

        this.element.parents('.kalamu-dashboard').trigger('kalamu.dashboard.new_row');
    },
    
    _addSection: function(e){
        console.log("Ajouter une section "+$(e.target).attr('data-section-type'));
    },

    _delete: function(e){
        e.preventDefault();
        this.element.remove();
        $(window).trigger("kalamu.row.remove");
    }

});