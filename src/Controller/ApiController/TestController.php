<?php

namespace App\Controller\ApiController;

use App\Entity\Game;

use App\Service\GameService;
use App\Service\VesselService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use JMS\Serializer\SerializerBuilder;
use JMS\Serializer\SerializationContext;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @Route("/api/test", name="api_test_")
 */
class TestController extends AbstractController
{
    /**
     * @Route("/vessels", name="vessels", methods={"GET"})
     */
    public function vessels(Request $request, VesselService $vesselService, EntityManagerInterface $em)
    {
        // Service
        $vessels = $vesselService->getForTest();
        $responseCode = 200;
        
        // Je renvoie les donnÃ©es au format JSON
        $data = json_encode($vessels, true);

        $response = new Response($data, $responseCode);
        $response->headers->set('Content-Type', 'application/json');
 
        return $response;
    }
}
