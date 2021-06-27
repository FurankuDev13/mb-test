// Params
var ignoreAjax = false;
var doNotWayPoint = false;
var dropzonesArray = [];

// Option Dropzone
if (typeof Dropzone != "undefined") {
    Dropzone.autoDiscover = false;
}

$(document).ready(function () {
    // Gestion appels AJAX - blocage des fonctions
    ajaxHandler();

    // Modals
    modalHandler();

    // DatePicker
    initDatePicker();

    // TinyMCE
    initTiniMce();

    // Select2
    initSelect2();

    // Tooltips
    initTooltips();

    $('#save-action').on('click', function(e) {
        $('#save-hidden').click();
    });
});

// Pace & HoldOn
function ajaxHandler() {
    Pace.on('start', function(e) {
        if (!ignoreAjax) {
            holdOn();
        }
        
    });

    Pace.on('restart', function(e) {
        if (!ignoreAjax) {
            holdOn();
        }
    });

    Pace.on('done', function(e) {
        HoldOn.close();
    });

    Pace.on('stop', function(e) {
        HoldOn.close();
    });

    $( document ).ajaxStart(function(e) {
        if (!ignoreAjax) {
            holdOn();
        }
    });

    $( document ).ajaxStop(function() {
        HoldOn.close();
    });
}

// Holdon
function holdOn() {
    var loader = "sk-falding-circle";
    if (loader.includes('/')) {
        HoldOn.open({
            theme:"custom",
            // If theme == "custom" , the content option will be available to customize the logo
            content:'<img style="width:80px;" src="' + loader + '" class="center-block">',
        });
    } else {
        HoldOn.open({
            theme:loader,
        });
    }
}

// Modal
function modalHandler() {
    // Draggable Modals
    $('.modal').draggable({
		start: function() {
		
		},
		
		stop: function() {
		
		}
	});

    // Resizable Modals
    $('.modal').on('shown.bs.modal', function (event) {
        var currentWidth = $(this).find('.modal-content').outerWidth();
        var currentHeight = $(this).find('.modal-content').outerHeight();

        $(this).find('.modal-content').resizable({
            alsoResize: ".modal-body",
            autoHide: true,
            containment: "body",
            minWidth: currentWidth,
            minHeight: currentHeight,
        });
    })
}

// DatePicker
function initDatePicker() {

    $(".datePicker").kendoDatePicker({
        format: "dd/MM/yyyy"
    });
}

// TinyMCE
function initTiniMce() {
    tinymce.init({
        selector: '.tinyClass',
        height: 250,
        width: '100%',
        menubar: false,
        plugins: [
            'advlist autolink lists link image charmap print preview anchor textcolor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount table '
        ],
        browser_spellcheck: true,
        toolbar: 'undo redo | formatselect | bold italic backcolor | table alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
        content_css: [
            '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
            '//www.tiny.cloud/css/codepen.min.css'
        ],
        setup : function(editor) {
            editor.on('keyup', function(event) {
                
            });
        }
    });
}

// Select2
function initSelect2() {
    $('.selectpicker').select2({
        placeholder: 'Sélectionner dans la liste',
        allowClear: true,
        width: '100%',
    });

    $('.selectpicker-multiple').select2({
        placeholder: 'Sélectionner dans la liste',
        width: '100%'
    });

    $('.selectpicker-multiple').on('select2:select', function(e){
        handleSelect2Order(e, this);
    });

    $('.selectpicker').on('select2:select', function(e){
        handleSelect2Order(e, this);
    });

}

// Select2 
function handleSelect2Order(e, selectElement) {
    var elm = e.params.data.element;
    $elm = jQuery(elm);
    $t = jQuery(selectElement);
    $t.append($elm);
    $t.trigger('change.select2')
}

// Select2
function initSelect2WithTags() {
    $('.selectpicker-tags').select2({
        placeholder: 'Sélectionner ou ajouter',
        width: '100%',
        tags: true,
    });

    $('.selectpicker-tags').on('select2:select', function (e) {
        handleSelect2Order(e, this);

        var data = e.params.data;
        var dataText = data['text'];
        var dataId = data['id'];
        var $parentSelect = $(this);

        if (isNaN(dataId)) {
            // Remove Option sans ID
            $('.selectpicker-tags option[value="' + dataId + '"]').prop('selected', false);
            $('.selectpicker-tags option[value="' + dataId + '"]').remove();
            $('.selectpicker-tags').trigger('change.select2');

            // Maj Google Map
            updateMap(dataText);

            // Cancel
            $('#new-place--modal').on('hide.bs.modal', function (e) {
                $('#new-place--modal').off('hide.bs.modal');
                $('#new-place--modal #lieu-save-button').off('click');
            })
        
            // Save
            $('#new-place--modal #lieu-save-button').on('click', function (e) {
                var labelData = $('#new-place--modal').find('#lieu-libelle-formatted').val();
                var latitudeData = $('#new-place--modal').find('#lieu-latitude').val();
                var longitudeData = $('#new-place--modal').find('#lieu-longitude').val();
        
                Pace.track(function(){
                    $.ajax({
                        method: "POST",
                        url: '../../api/lieu/new-or-update',
                        data: {
                            label: labelData,
                            latitude: latitudeData,
                            longitude: longitudeData,
                        }
                    })
                    .done(function( result ) {
                        if (result != null) {
                            var newId = result;

                            // Update Input
                            $('.selectpicker-tags').each(function( index ) {
                                if ($(this).attr('id') == $parentSelect.attr('id')) {
                                    var newOption = new Option(labelData, newId, true, true);
                                } else {
                                    var newOption = new Option(labelData, newId, false, false);
                                }
                                $(this).append(newOption).trigger('change');
                            });
                            
                            // Close modal
                            $('#new-place--modal').off('hide.bs.modal');
                            $('#new-place--modal #lieu-save-button').off('click');
                            $('#new-place--modal').modal('hide');
                        } 
                    });
                });
            }); 
        }
    });
}

// Tooltips
function initTooltips() {
    $('[title]').kendoTooltip({
        autoHide: true,
        width: 400,
        position: "top",
        show: function() {
            
        },
        error: function(e) {
           
        }
    });
}

// Tooltips
function setImageTooltip($target) {
    var title = $target.data('titre');
    var alt = $target.data('alt');

    $target.attr('title', '<h5 class="tooltip-image-title">Titre: <span class="text-brand">' + title + '</span></h5><h6 class="tooltip-image-alt">Alt: <span class="text-brand">' + alt + '</span></h6>');
    initTooltips();
}

// Dropzone
function initDropzone($dropzone) {
    // Params
    var multiple = $dropzone.data('multiple');
    var maxFiles = $dropzone.data('maxfiles');
    var maxFilesize = $dropzone.data('maxfilesize'); 
    var acceptedFiles = $dropzone.data('acceptedfiles');
    var entity = $dropzone.data('entity');
    var entityId = $dropzone.data('entityid'); 
    var className =  $dropzone.data('classname');
    var fileUploadHandler = $dropzone.data('fileuploadhandler');
    var ajaxFileDelete = $dropzone.data('ajaxfiledelete');
    var fillDropzone = $dropzone.data('filldropzone');
    var baseurl = $dropzone.data('baseurl');

    var fileAccepted = 'image/*';

    switch (acceptedFiles) {
        case 'image':
            fileAccepted = 'image/*';
            break;
        case 'psd':
            fileAccepted = '.psd';
            break;
        case 'pdf':
            fileAccepted = 'application/pdf';
            break;
        case 'jpeg':
            fileAccepted = '.jpeg, .jpg';
            break;
    };

    if (typeof dropzonesArray == 'undefined') {
        var dropzonesArray = []; 
    }

    // Init Dropzone + Load
    dropzonesArray[className] = new Dropzone("." + className, {
        url: fileUploadHandler,
        maxFiles: maxFiles,
        dictMaxFilesExceeded: 'Seulement ' + maxFiles + ' peuvent être chargées',
        dictDefaultMessage: 'Cliquer ou glisser pour charger',
        acceptedFiles: fileAccepted,
        maxFilesize: maxFilesize,
        addRemoveLinks: true,
        init: function () {
            this.on("maxfilesexceeded", function (file) {
                customInfo("Erreur", "Le nombre maximum de document a été atteint");
                this.removeFile(file);
            });
            this.on("sending", function (file, xhr, formData) {
                formData.append("entity", entity);
                formData.append("entityId", entityId);
            });
            this.on("success", function (file, response) {
                customInfo("Ajout", "Le document a été ajouté");
                var $target = $(file.previewElement);
                var id = response['id'];
                var alt = response['alt'];
                var title = response['title'];

                $target.data('id', id);
                $target.attr('data-uid', id);
                $target.data('alt', alt);
                $target.data('titre', title);

                setImageTooltip($target);
            });
            this.on("addedfile", function (file, response) {
                var $target = $(file.previewElement);
                var id = file.id;
                var url = file.url;
                var alt = file.alt;
                var title = file.title;


                $target.data('id', id);
                $target.attr('data-uid', id);
                $target.data('alt', alt);
                $target.data('titre', title);
                $target.find('.dz-remove').hide();
                $target.find('.dz-filename').hide();
                
                var $imageToolsContainer = $(
                    '<div class="image-tools-container d-flex justify-content-center align-items-center">'
                        + '<div class="dropdown d-inline">'
                            + '<button class="price_link btn btn-focus text-secondary p-1 mr-1 dropdown-toggle" type="button" id="dropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
                                + '<i class="fas fa-cog"></i>'
                            + '</button>'
                            + '<div class="dropdown-menu p-1 border-brand" aria-labelledby="dropdownMenu" style="min-width:250px;">'
                                + '<ul class="image-tools p-1 mb-1">'
                                + '</ul>'
                            + '</div>'
                        + '</div>'
                    + '</div>'
                );

                setImageTooltip($target);

                var $viewLink = $('<button type="button" class="view-button btn text-custom"><i class="far fa-eye"></i>&nbsp;Voir l\'image</button>');
                var $editTitleLink = $('<button type="button" class="edit-button btn text-custom"><i class="far fa-edit"></i>&nbsp;Modifier le titre</button>');
                var $editAltLink = $('<button type="button" class="edit-button btn text-custom"><i class="far fa-edit"></i>&nbsp;Modifier la balise Alt</button>');
                var $deleteLink = $('<button type="button" class="delete-button btn text-brand"><i class="far fa-trash-alt"></i>&nbsp;Supprimer l\'image</button>');

                $viewLink.on('click', function(e) {
                    window.open(url, '_blank');
                });

                $editTitleLink.on('click', function(e) {
                    var currentTitle = $target.data('titre');

                    iziToast.question({
                        drag: false,
                        close: false,
                        overlay: true,
                        timeout: false,
                        title: 'Titre',
                        message: 'Veuillez indiquer le titre du fichier',
                        position: 'center',
                        inputs: [
                            ['<input type="text" value="' + currentTitle + '">', 'keyup', function (instance, toast, input, e) {

                            }, true], // true to focus
                        ],
                        buttons: [
                            ['<button><b>Confirmer</b></button>', function (instance, toast, button, e, inputs) {
                                var valueData = inputs[0].value;
                                var entite = "Document";
                                var entiteId = id;

                                // Update en AJAX
                                updateEntityTitle(entite, entiteId, valueData);
                                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                            }, false], // true to focus
                            ['<button>Annuler</button>', function (instance, toast) {
                                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                            }],
                        ]
                    });
                    
                });

                $editAltLink.on('click', function(e) {
                    var currentAlt = $target.data('alt');

                    iziToast.question({
                        drag: false,
                        close: false,
                        overlay: true,
                        timeout: false,
                        title: 'Alt',
                        message: 'Veuillez indiquer la valeur de la balise Alt du fichier',
                        position: 'center',
                        inputs: [
                            ['<input type="text" value="' + currentAlt + '">', 'keyup', function (instance, toast, input, e) {

                            }, true], // true to focus
                        ],
                        buttons: [
                            ['<button><b>Confirmer</b></button>', function (instance, toast, button, e, inputs) {
                                var valueData = inputs[0].value;
                                var entite = "Document";
                                var entiteId = id;

                                // Update en AJAX
                                updateEntityAlt(entite, entiteId, valueData);
                                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                            }, false], // true to focus
                            ['<button>Annuler</button>', function (instance, toast) {
                                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                            }],
                        ]
                    });
                    
                });

                $deleteLink.on('click', function(e) {
                    iziToast.question({
                        close: false,
                        overlay: true,
                        displayMode: 'once',
                        id: 'question',
                        zindex: 999,
                        title: 'Suppression',
                        message: 'Confirmez vous la suppression ?',
                        position: 'center',
                        buttons: [
                            ['<button><b>Supprimer</b></button>', function (instance, toast) {
                                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                                dropzonesArray[className].removeFile(file);
                            }, true],
                            ['<button>Annuler</button>', function (instance, toast) {
                                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                            }],
                        ],
                        onClosing: function(instance, toast, closedBy){
                            
                        },
                        onClosed: function(instance, toast, closedBy){
                            
                        }
                    });
                    
                });

                $imageToolsContainer.find('.image-tools').append($viewLink);
                $imageToolsContainer.find('.image-tools').append($editTitleLink);
                $imageToolsContainer.find('.image-tools').append($editAltLink);
                $imageToolsContainer.find('.image-tools').append($deleteLink);
                $target.append($imageToolsContainer);
            });
        }
    });

    // Post
    var data = {"id": entityId,'entite': entity};
    var url = fillDropzone;

    $.ajax({ 
        type: "POST",
        url: url,
        data: data,
        dataType: "json",
        success: function (response) {
            var photos = response["photo"];
            $.each(photos, function (photo) {
                var myphoto = photos[photo];
                if (myphoto['extension'] == "pdf") {
                    var urlThumbsCustom = baseurl + "/uploads/" + myphoto.entite + '/thumbs/' + myphoto.path + ".png";
                } else {
                    var urlThumbsCustom = baseurl + "/uploads/" + myphoto.entite + '/thumbs/' + myphoto.path;
                }

                var mockFile = {
                    name: myphoto.libelle,
                    alt: myphoto.alt,
                    title: myphoto.titre,
                    size: response['sizes'][photo],
                    type: 'image/jpeg',
                    url: baseurl + "/uploads/" + myphoto.entite + '/' + myphoto.path,
                    urlThumbs: urlThumbsCustom,
                    chemin: myphoto.path,
                    id: myphoto.id,
                    accepted: true
                };
                
                dropzonesArray[className].files.push(mockFile);
                dropzonesArray[className].emit('addedfile', mockFile);
                dropzonesArray[className].emit("thumbnail", mockFile, mockFile.urlThumbs);
                dropzonesArray[className].emit('complete', mockFile);
            });

            $.each($('.' + className).find('.dz-complete'), function (index) {
                $(this).data('linkUrl', baseurl + "/uploads/" + photos[index].entite + '/' + photos[index].path);
            });            
        }

    });

    // Delete
    dropzonesArray[className].on("removedfile", function (file) {
        var del_url = ajaxFileDelete;
        del_url = del_url.replace("none", file.id);
        $.ajax({
            type: "POST",
            url: del_url,
            data: {},
            dataType: "json",
            success: function (response) {
                var element = $('#doc-container-' + response["id"]);
                element.remove();                    
            }
        });
    });

    // Sortable
    dropzoneSortable(className);
}

// Dropzone
function dropzoneSortable(className) {
    $("." + className).kendoSortable({
        filter: ".dz-preview",
        start: function(e) {
            var item = e.item;
            var $item = $(item);
        },
        change: function(e) {
            var entite = "Document";
            $("." + className + " .dz-preview").each(function( index ) {
                var entiteId = $(this).data('id');

               // Update en AJAX
               updateEntityOrder(entite, entiteId, index + 1);
            });  
        },
        end: function(e) {
            var item = e.item;
            var $item = $(item);
        }
    });
}

// Forms
function initNav(draw = true) { 
    var $nav = $('#bhoechie-tab-menu-container');
    $nav.find('.bhoechie-link-item').remove();
    var waypoints = [];

    $('.bhoechie-tab-target .card-header').each(function(i) {
        if ($(this).find('input').length > 0) {
            var $parent = $(this).parents('.main-card');

            var entity = $parent.data('entite');
            var entityId = $parent.data('id'); 
            
            if (typeof entity != "undefined" && typeof entityId != "undefined") {
                var libelle = '<span class="sortable"><i class="fas fa-arrows-alt-v"></i>&nbsp;</span>';
                var sortable = "sortable";
            } else {
                var libelle = '<span class="sortable"><i class="fas fa-arrows-alt-v"></i>&nbsp;</span>';
                var sortable = "sortable";
            }

            var libelleValue = $(this).find('input.contenu-libelle').val();

            if (libelleValue.length > 30) {
                libelleValue = libelleValue.substring(0, 30) + "...";
            }

            libelle += '<span class="link--libelle">' + libelleValue + '</span>';
        
        } else {
            var libelle = $(this).text();
            var sortable = "not-sortable";
        }
        
        var $target = $(this);
        $(this).attr('data-id', i);

        // Ajout du bouton dans NAV
        var $link = $('<li data-sortable="' + sortable + '" data-target="' + i + '" class="nav-link bhoechie-link-item ' + sortable + ' "><span class="bhoechie-link"><i class="pe-7s-settings"></i>&nbsp;' + libelle + '</span></li>');
        $nav.append($link);

        // Ajout Waypoint pour gestion Scroll
        waypoints.push(new Waypoint({
            element: $(this),
            handler: function() {
                if (doNotWayPoint == false) {
                    var index = this.element.data('id');
                    $('.bhoechie-link-item').removeClass('active');
                    $('.bhoechie-link-item[data-target="' + index + '"]').addClass('active');
                }
            },
            context: $('.bhoechie-tab-target')
        }))

        // Ajout listener pour Scroll au click
        $link.on('click', function(e) {
            if (!$(this).hasClass("active")) {
                moveToTarget($link, $target);
            }
        });

        // Ajout listener pour MAJ texte selon Input
        $target.find('input').on( 'keyup', function () {
            var newText = $(this).val();

            if (newText.length > 30) {
                newText = newText.substring(0, 30) + "...";
            }

            $link.find('.bhoechie-link .link--libelle').text(newText);
        });
    });

    $('.bhoechie-link-item').first().addClass('active');

    $("#bhoechie-tab-menu-container").kendoSortable({
        filter: ".sortable",
        change: function(e) {
            var limit = $(".bhoechie-link-item.sortable").length;
            $(".bhoechie-link-item.sortable").each(function( index ) {
                
                if (index < limit - 1 ) {
                    var elementIndex = index + 1;
                    
                    var itemTarget = $(this).data('target');
                    var $itemForm = $('.bhoechie-tab-target .card-header[data-id="' + itemTarget + '"');
                    var $parent = $itemForm.parents('.contenu--element');
                    if ($parent.length == 0) {
                        $parent = $itemForm.parents('.contenu--day');
                    }

                    // Update Champ Form
                    $itemForm.find('.contenu-ordre').val(elementIndex);
                    $('.bhoechie-tab-target').append($parent);
                }
            });

            for (var wayIndex in waypoints) {
                waypoints[wayIndex].destroy();
            }

            setTimeout(function(){ initNav(); }, 1000);
            
        },
        end: function(e) {
            // setTimeout(function(){ initNav();console.log('test'); }, 300);
        }
    });
}

// Forms
function moveToTarget($link, $target) {
    doNotWayPoint = true;
    $('.bhoechie-link-item').removeClass('active');
    $link.addClass('active');

    $('body .bhoechie-tab-target').animate({
        scrollTop: $('.bhoechie-tab-target .card-header').first().position().top
    }, 1, function() {
        $('body .bhoechie-tab-target').animate({
            scrollTop: $target.position().top
        }, 300, function() {
            doNotWayPoint = false;
        });
    });
}

// Form & DropZone
function updateEntityOrder(entity, entityId, index) {
    if (typeof entity != "undefined" && typeof entityId != "undefined" && typeof index != "undefined") {
        $.ajax({
            method: "PUT",
            url: '../api/form/' + entity + '/' + entityId + '/ordre',
            dataType: 'json',
            data: {
                'ordre': index,
            }
        })
        .fail(function() {
            customError("Ordre", "Une erreur est survenue");
        })
        .done(function( data ) {
            customSuccess("Ordre", "L'ordre des éléments a été mis à jour'");

            return data;
        });
    }
}

// Form & DropZone
function updateEntityTitle(entity, entityId, value) {
    if (typeof entity != "undefined" && typeof entityId != "undefined" && typeof value != "undefined") {
        $.ajax({
            method: "PUT",
            url: '../api/form/' + entity + '/' + entityId + '/titre',
            dataType: 'json',
            data: {
                'title': value,
            }
        })
        .fail(function() {
            customError("Titre", "Une erreur est survenue");
        })
        .done(function( data ) {
            customSuccess("Titre", "L'élement a été mis à jour'");
            var $target = $('.dz-preview[data-uid="' + entityId + '"]');
            $target.data('titre', data);
            setImageTooltip($target);

            return data;
        });
    }
}

// Form & DropZone
function updateEntityAlt(entity, entityId, value) {
    if (typeof entity != "undefined" && typeof entityId != "undefined" && typeof value != "undefined") {
        $.ajax({
            method: "PUT",
            url: '../api/form/' + entity + '/' + entityId + '/alt',
            dataType: 'json',
            data: {
                'alt': value,
            }
        })
        .fail(function() {
            customError("Alt", "Une erreur est survenue");
        })
        .done(function( data ) {
            customSuccess("Alt", "L'élement a été mis à jour'");
            var $target = $('.dz-preview[data-uid="' + entityId + '"]');
            $target.data('alt', data);
            setImageTooltip($target);

            return data;
        });
    }
}