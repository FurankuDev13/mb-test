$(document).ready(function () {
    // Ajouter la flotte (x50 vaisseaux)
    $('#fleet-add').on('click', function(e) {
        testAddFleet();
    });

});

// Ajouter la flotte (x50 vaisseaux)
function testAddFleet()
{
    Pace.track(function(){
        $.ajax({
            method: "GET",
            url: "/api/test/vessels",
        })
        .done(function( result ) {
            if (result != null) {
                // RESET 
                var $td = $("#test-container td").text("").removeClass('text-primary').removeClass('text-info');

                // DRAW
                for(var index in result)
                {
                    var coord = index.split('/');
                    var x = parseInt(coord[0]) - 1;
                    var y = parseInt(coord[1]) - 1;
                    var vessel = result[index];

                    console.log(vessel);

                    var $td = $("#test-container .table tr:nth-child(" + x + ")").find(":nth-child(" + y + ")");
                    $td.text(vessel['vessel_type_label'].charAt(0));

                    if(vessel['isOffensive'])
                    {
                        $td.addClass('text-primary');
                    }

                    if(vessel['isOffensive'])
                    {
                        $td.addClass('text-info');
                    }
                }
            } 
        });
    });
    
}

