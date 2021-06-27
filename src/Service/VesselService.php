<?php

namespace App\Service;

use App\Entity\Game;
use App\Entity\Question;
use App\Entity\Answer;
use App\Entity\Vessel;
use App\Entity\VesselType;
use App\Enum\VesselTypeEnum;
use Doctrine\ORM\EntityManagerInterface; 
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class VesselService {

    private $em;
    private $session;
    
    public function __construct(EntityManagerInterface $em, SessionInterface $session)
    {
        $this->em = $em;
        $this->session = $session;
    }

    // Get Data (ALL)
    public function getForTest() 
    {
        // Params SUPPORT
        $supportsMaxCount = 25;
        $supportParentType = $this->em->getRepository(VesselType::class)->find(VesselTypeEnum::SUPPORT);

        // Check si vaisseaux existent en base
        $supportVessels = $this->em->getRepository(Vessel::class)->getForTest(VesselTypeEnum::SUPPORT, $supportsMaxCount);
        $supportsCurrentCount = count($supportVessels);

        // Si pas assez de vaisseaux on en ajoute en base
        if($supportsCurrentCount < $supportsMaxCount)
        {
            $supportTypes = $this->em->getRepository(VesselType::class)->findByparent($supportParentType);
         
            for ($i = $supportsCurrentCount + 1; $i <= $supportsMaxCount ; $i++)
            {
                // Params
                $randomIdKey = array_rand($supportTypes, 1);

                // NEW
                $newVessel = new Vessel();
                $newVessel->setCode("#" . ($i));
                $newVessel->setVesselType($supportTypes[$randomIdKey]);

                $this->em->persist($newVessel);
            }

            $this->em->flush();

            $supportVessels = $this->em->getRepository(Vessel::class)->getForTest(VesselTypeEnum::SUPPORT, $supportsMaxCount);
        }

        // Params OFFENSIVE
        $offensiveMaxCount = 25;
        $offensiveParentType = $this->em->getRepository(VesselType::class)->find(VesselTypeEnum::OFFENSIVE);

        // Check si vaisseaux existent en base
        $offensiveVessels = $this->em->getRepository(Vessel::class)->getForTest(VesselTypeEnum::OFFENSIVE, $offensiveMaxCount);
        $supportsCurrentCount = count($offensiveVessels);

        // Si pas assez de vaisseaux on en ajoute en base
        if($supportsCurrentCount < $offensiveMaxCount)
        {
            $supportTypes = $this->em->getRepository(VesselType::class)->findByparent($offensiveParentType);
         
            for ($i = $supportsCurrentCount + 1; $i <= $offensiveMaxCount ; $i++)
            {
                // Params
                $randomIdKey = array_rand($supportTypes, 1);

                // NEW
                $newVessel = new Vessel();
                $newVessel->setCode("#" . ($i));
                $newVessel->setVesselType($supportTypes[$randomIdKey]);

                $this->em->persist($newVessel);
            }

            $this->em->flush();

            $offensiveVessels = $this->em->getRepository(Vessel::class)->getForTest(VesselTypeEnum::OFFENSIVE, $offensiveMaxCount);
        }

        // Création aléatoire des coordoonées
        $structuredResponse = [];
        $maxX = 100;
        $maxY = 100;

        // Vaisseaux supports
        $count = $supportsMaxCount;
        while($count > 0)
        {
            $coord = rand(1, $maxX) . "/" . rand(1, $maxY);

            if(!isset($structuredResponse[$coord]))
            {
                // Navire Support au hasard
                $randomVesselKey = array_rand($supportVessels, 1);

                $structuredResponse[$coord] = $supportVessels[$randomVesselKey];
                $structuredResponse[$coord]['isOffensive'] = 0;
                $structuredResponse[$coord]['isSupport'] = 1;
                $count--;
            }
        }
        // Vaisseaux supports
        $count = $offensiveMaxCount;
        while($count > 0)
        {
            $coord = rand(1, $maxX) . "/" . rand(1, $maxY);

            if(!isset($structuredResponse[$coord]))
            {
                // Navire Support au hasard
                $randomVesselKey = array_rand($offensiveVessels, 1);

                $structuredResponse[$coord] = $offensiveVessels[$randomVesselKey];
                $structuredResponse[$coord]['isOffensive'] = 1;
                $structuredResponse[$coord]['isSupport'] = 0;
                $count--;
            }
        }

        return $structuredResponse;
    }
}
