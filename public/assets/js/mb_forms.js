var alteredForm = false;
var contenusConfigArray = $('#contenu--container').data('config');

jQuery(document).ready(function() {
    // Nav
    initNav();

    // Dropzones
    $('.dropzone--multiple').each(function() {
        initDropzone($(this));
    });

    $('.contenu--element').each(function() {
          // TinyMCE
        if ($(this).find('.contenu-type').val() == 5) {
            $(this).find('.contenu-contenu').addClass('tinyClass');
        }
        if ($(this).find('.contenu-type').val() == 7) {
            $(this).find('.contenu-contenu').addClass('d-none');
            $(this).find('.contenu-elements-container').removeClass('d-none');

            initElementsPrototypes($(this)); 
        }
        initTiniMce();

        // Dropzones
        var config = $(this).data('config');
        if (config in contenusConfigArray && 'images' in contenusConfigArray[config] && contenusConfigArray[config]['images'] == true) {
            $(this).find('.dropzone').removeClass('d-none');
        }
    });

    // Prototypes
    initPrototypes();  
})
   
function initPrototypes() {
    // Container 
    var $entityCollectionHolder = $('#contenu--container');
    var $entityActionsHolder = $('#bhoechie-tab-actions-container');

    // Bouton Delete & Copy
    $entityCollectionHolder.find('.contenu--element').each(function() {
        addFormToolsButtons($entityCollectionHolder, $(this));
    });

    $entityCollectionHolder.data('index', $('.contenu--element').length);

    doNotWayPoint = true;
    for (var configIndex in contenusConfigArray) {
        var config = contenusConfigArray[configIndex];
        $model = false;
 
        if (config['required'] == true) {
            if ((config['multiple'] == false && $('.contenu--element[data-config="' + configIndex + '"]').length == 0) || config['multiple'] == true) {
                addEntityForm($entityCollectionHolder, $model, config, configIndex);
            }
            
        }

        if ((config['multiple'] == false && $('.contenu--element[data-config="' + configIndex + '"]').length == 0) || config['multiple'] == true) {
            if ($entityActionsHolder.find('.buttons-dropdown').length == 0) {
                $buttonsDropdown = $(
                    '<div class="dropdown buttons-dropdown d-inline">'
                        + '<button class="add_contenu_link btn btn-link text-brand dropdown-toggle" type="button" id="dropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
                            + '<i class="fas fa-plus"></i>&nbsp;Ajouter un contenu'
                        + '</button>'
                        + '<div class="dropdown-menu p-1 border-brand" aria-labelledby="dropdownMenu" style="min-width: 300px;">'
                            + '<ul class="actions--container p-1 mb-1">'
                            + '</ul>'
                        + '</div>'
                    + '</div>'
                );
                $entityActionsHolder.append($buttonsDropdown);
            }
            var icon = config['multiple'] == true ? '<i class="fas fa-plus-circle"></i>' : '<i class="fas fa-plus"></i>';
            var $addContenuButton = $('<button type="button" class="btn btn-link new-contenu-button text-left text-brand w-50">' + icon + '&nbsp;' + config['label'] + '</button>');

            $addContenuButton.data('config', config);
            $addContenuButton.data('index', configIndex);
            $entityActionsHolder.find('.buttons-dropdown .actions--container').append($addContenuButton);

            $addContenuButton.on('click', function(e) {
                var config = $(this).data('config');
                var configIndex = $(this).data('index');
                addEntityForm($entityCollectionHolder, $model, config, configIndex);
                if (config['multiple'] == false) {
                    $(this).remove();
                }

                if ($('.new-contenu-button').length == 0) {
                    $buttonsDropdown.remove();
                } 
            });
        }
    }
    doNotWayPoint = false;
    
}

function addFormToolsButtons($entityCollectionHolder, $form, entityId = false) {
   var $formToolsContainer = $form.find('.kt-portlet__head-actions');

   var $deleteButton = $(
        '<li class="dropdown-item text-left"><button class="delete_link btn btn-focus text-brand p-1" type="button"><i class="fas fa-trash-alt"></i>&nbsp;Supprimer le contenu</button></li>'
    );

    var $copyButton = $(
        '<li class="dropdown-item text-left"><button class="copy_link btn btn-focus text-brand p-1" type="button"><i class="far fa-clone"></i>&nbsp;Dupliquer le contenu</button></li>'
    );

    var $toolsButtons = $(
        '<div class="dropdown d-inline">'
            + '<button class="price_link btn btn-focus text-secondary p-1 mr-1 dropdown-toggle" type="button" id="dropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
                + '<i class="fas fa-cog"></i>'
            + '</button>'
            + '<div class="dropdown-menu p-1 border-brand" aria-labelledby="dropdownMenu">'
                + '<ul class="actions--container p-1 mb-1">'
                + '</ul>'
            + '</div>'
        + '</div>'
    );

    var config = $form.data('config');

    if (config in contenusConfigArray && 'multiple' in contenusConfigArray[config] && contenusConfigArray[config]['multiple'] == true) {
        $toolsButtons.find('.actions--container').append($copyButton);
    }
    if (config in contenusConfigArray && 'required' in contenusConfigArray[config] && contenusConfigArray[config]['required'] == false) {
        $toolsButtons.find('.actions--container').append($deleteButton);
    }

    if ($toolsButtons.find('button').length > 1) {
        $formToolsContainer.append($toolsButtons);
    }
    
    $deleteButton.on('click', function(e) {
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
                    alteredForm = true;
                    $form.remove();
                    initNav();
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

    $copyButton.on('click', function(e) {
        alteredForm = true;
        addEntityForm($entityCollectionHolder, $form);
    });
}

function addEntityForm($entityCollectionHolder, $model = false, config = false, configIndex = false) {
    var prototype = $entityCollectionHolder.data('prototype');
    var index = $entityCollectionHolder.data('index');

    var newForm = prototype;
    newForm = newForm.replace(/__name__/g, index);

    $entityCollectionHolder.data('index', index + 1);

    var $newForm = $(newForm);
    $entityCollectionHolder.append($newForm);

    if ($model) {
        tinyMCE.triggerSave();
        var originLibelle = $model.find('.contenu-libelle').val();
        $newForm.find('.contenu-libelle').val(originLibelle + ' (copie)');
        var originType = $model.find('.contenu-type').val();
        $newForm.find('.contenu-type').val(originType);
        var originCode = $model.find('.contenu-code').val();
        $newForm.find('.contenu-code').val(originCode);
        var originContenu = $model.find('.contenu-contenu').val();
        $newForm.find('.contenu-contenu').val(originContenu);
        var ordre = $('.contenu--element').length + 1;
        $newForm.find('.contenu-ordre').val(ordre);
        var originConfig = $model.data('config');
        $newForm.attr('data-config', originConfig);
    } else if (config) {
        var configLibelle = config['label'];
        $newForm.find('.contenu-libelle').val(configLibelle);
        var configLibelle = config['type'];
        $newForm.find('.contenu-type').val(configLibelle); 
        if ('content' in config) {
            var configContent = config['content'];
            $newForm.find('.contenu-contenu').val(configContent); 
        }
        $newForm.find('.contenu-code').val(configIndex); 
        var ordre = $('.contenu--element').length + 1;
        $newForm.find('.contenu-ordre').val(ordre);
        $newForm.attr('data-config', configIndex);
        
    } else {
        $newForm.find('.contenu-libelle').val('Titre du contenu');
        $newForm.find('.contenu-contenu').val('Contenu');
        var ordre = $('.contenu--element').length + 1;
        $newForm.find('.contenu-ordre').val(ordre);
    }

    addFormToolsButtons($entityCollectionHolder, $newForm);
    if ($newForm.find('.contenu-type').val() == 5) {
        $newForm.find('.contenu-contenu').addClass('tinyClass');
    }
    if ($newForm.find('.contenu-type').val() == 7) {
        $newForm.find('.contenu-contenu').addClass('d-none');
        $newForm.find('.contenu-elements-container').removeClass('d-none');
        var proto = true;
        // initElementsPrototypes($newForm, proto); 
    }
    
    initTiniMce();
    initNav();

    if (!config) {
        $('.bhoechie-link-item').last().click();
    }
    
}

function initElementsPrototypes($contenu, proto = false) {
    // Container 
    var $entityCollectionHolder = $contenu.find('.contenu-elements-container');
    var $contenuToolsContainer = $contenu.find('.contenu-elements-container');

    // Bouton Delete & Copy
    $entityCollectionHolder.find('.contenu-sub-element').each(function() {
        addElementToolsButtons($entityCollectionHolder, $(this));
    });

    // Bouton Add
    var $addButton = $('<button type="button" class="add_service_group_link btn btn-focus text-brand mt-1 pt-1 pb-1"><i class="fas fa-plus-circle fa-lg"></i>&nbsp;Ajouter un élement à la liste</button>');

    // Valeurs par défaut
    var config = $contenu.data('config');
    if ('content' in contenusConfigArray[config] && $entityCollectionHolder.find('.contenu-sub-element').length == 0) {
        var contents = contenusConfigArray[config]['content'];
        for (var contentIndex in contents) {
            var  content = contents[contentIndex];
            addElementToList($entityCollectionHolder, proto, content);
        }
    }

    $contenuToolsContainer.after($addButton);

    $entityCollectionHolder.data('index', $entityCollectionHolder.find('.contenu-sub-element').length);

    $addButton.on('click', function(e) {
        addElementToList($entityCollectionHolder, proto);
    });

    manageSortable($entityCollectionHolder);

}

function addElementToolsButtons($entityCollectionHolder, $element, entityId = false) {
   var $elementToolsContainer = $element.find('.sub-element-tools');

   var $deleteButton = $(
        '<li class="dropdown-item text-left"><button class="delete_link btn btn-focus text-brand p-1" type="button"><i class="fas fa-trash-alt"></i>&nbsp;Supprimer l\'élément</button></li>'
    );

    var $copyButton = $(
        '<li class="dropdown-item text-left"><button class="copy_link btn btn-focus text-brand p-1" type="button"><i class="far fa-clone"></i>&nbsp;Dupliquer l\'élément</button></li>'
    );

    var $toolsButtons = $(
        '<div class="dropdown d-inline">'
            + '<button class="price_link btn btn-focus text-secondary p-1 mr-1 dropdown-toggle" type="button" id="dropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
                + '<i class="fas fa-cog"></i>'
            + '</button>'
            + '<div class="dropdown-menu p-1 border-brand" aria-labelledby="dropdownMenu">'
                + '<ul class="actions--container p-1 mb-1">'
                + '</ul>'
            + '</div>'
        + '</div>'
    );

    $toolsButtons.find('.actions--container').append($deleteButton);

    if ($toolsButtons.find('button').length > 1) {
        $elementToolsContainer.append($toolsButtons);
    }
    
    $deleteButton.on('click', function(e) {
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
                    alteredForm = true;
                    $element.remove();
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

    $copyButton.on('click', function(e) {
        alteredForm = true;
        addElementToList($entityCollectionHolder, proto, $form);
    });
}

function addElementToList($entityCollectionHolder, proto = false, content = false) {
    var prototype = $entityCollectionHolder.data('prototype');
    var index = $entityCollectionHolder.data('index');

    var newForm = prototype;
    newForm = newForm.replace(/__name__/g, index);

    $entityCollectionHolder.data('index', index + 1);

    var $newForm = $(newForm);

    var ordre = $entityCollectionHolder.find('.contenu-sub-element').length + 1;
    $newForm.find('.contenu-element-ordre').val(ordre);

    if (content) {
        var label = content;
    } else {
        var label = "Nouvel élément";
    }
    
    $newForm.find('.contenu-element-libelle').val(label);

    $entityCollectionHolder.append($newForm);

    addElementToolsButtons($entityCollectionHolder, $newForm); 
}

function manageSortable($entityCollectionHolder) {
    $entityCollectionHolder.kendoSortable({
        filter: ".contenu-sub-element",
        ignore: "input",
        change: function(e) {

            $entityCollectionHolder.find(".contenu-sub-element").each(function( index ) {
                // Update Champ Form
                $(this).find('.contenu-element-ordre').val(index + 1);
            });
            
        },
        end: function(e) {

        }
    });
}



