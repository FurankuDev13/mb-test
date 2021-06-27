<?php

namespace App\Controller;

use App\Entity\Vessel;
use App\Form\VesselFormType;

use Doctrine\ORM\EntityManagerInterface;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @Route("/", name="vessel_")
 */
class VesselController extends AbstractController
{
    /**
     * @Route("/vessels", name="index", methods={"GET"})
     */
    public function index(Request $request): Response
    {
        // SQL
        $sql_list = 
            ' SELECT mb_vessel.id
                , mb_vessel.is_active
                , mb_vessel.code
                , mb_vessel_type.label AS `mb_vessel_type-label`
                FROM mb_vessel mb_vessel
                LEFT JOIN mb_vessel_type mb_vessel_type ON mb_vessel_type.id = mb_vessel.vessel_type_id
                WHERE 1 = 1  
            '
        ;

        // Widgets
        $widgets = 
            [
                [
                    'titre' => 'Vessels',
                    'code' => 'vessel_list',
                    'taille' => 12,
                    'sql' => $sql_list,
                    'champs' =>
                        [
                            "id" => 
                            [
                                'affichage' => false,
                                'filtre' => false,
                                'label' => "ID"
                            ],
                            "is_active" => 
                            [
                                'affichage' => true,
                                'filtre' => true,
                                'label' => "Statut"
                            ],
                            "code" => 
                            [
                                'affichage' => true,
                                'filtre' => true,
                                'label' => "Code"
                            ],
                            "mb_vessel_type-label" => 
                            [
                                'affichage' => true,
                                'filtre' => true,
                                'label' => "Type"
                            ],
                        ]
                    ,
                    'config' =>
                        [
                            'new' => true,
                            'edit' => true,
                            'delete' => true,
                            'inline' => true,
                            'print' => true,
                            'copy' => true,
                            'excel' => true,
                            'csv' => true,
                            'pdf' => true,
                            'reset' => true,
                            'viewAll' => true,
                            'selectAll' => true,
                            'selectNone' => true,
                            'colvis' => true,
                        ]
                    ,
                ]
            ]  
        ;

        return $this->render('partial/index.html.twig', [
           'controller_name' => 'VesselController',
           'widgets' => $widgets,
        ]);
    }

    /**
     * @Route("/new_mb_vessel", name="newLkVessel", methods={"GET","POST"})
     * @Route("/vessel/new", name="new", methods={"GET","POST"})
     */
    public function new(Request $request): Response
    {
        $vessel = new Vessel();

        $form = $this->createForm(VesselFormType::class, $vessel);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($vessel);
            $entityManager->flush();
            
            $this->addFlash(
                'info',
                "Le navire " . $vessel->getCode() . ' a été ajouté !'
            );

            return $this->redirectToRoute('vessel_index');
        }

        return $this->render('vessel/new.html.twig', [
            'vessel' => $vessel,
            'form' => $form->createView(),
            'action' => 'Ajouter un navire',
            'retour' => 'vessel_index'
        ]);
    }

    /**
     * @Route("/edit_mb_vessel/{id}", name="editLkVessel", methods={"GET","POST"})
     * @Route("/vessel/{id}", name="edit", methods={"GET","POST"})
     */
    public function edit(Request $request, Vessel $vessel): Response
    {
        if (!$vessel) {
            throw $this->createNotFoundException("Le navire n'existe pas"); 
        }

        $form = $this->createForm(VesselFormType::class, $vessel);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->getDoctrine()->getManager()->flush();
            
            $this->addFlash(
                'info',
                "Le navire " . $vessel->getCode() . ' est mis à jour !'
            );

            return $this->redirectToRoute('vessel_edit', [
                'id' => $vessel->getId(),
            ]);
        }

        return $this->render('vessel/edit.html.twig', [
            'vessel' => $vessel,
            'form' => $form->createView(),
            'action' => $vessel->getCode(),
            'retour' => 'vessel_index'      
        ]);
    }

    /**
     * @Route("/delete_mb_vessel/{id}", name="deleteLkVessel", methods={"GET", "DELETE"})
     * @Route("/vessel/{id}", name="delete", methods={"DELETE"})
     */
    public function delete(Request $request, Vessel $vessel): Response
    {
        if (!$vessel) {
            throw $this->createNotFoundException("Le navire n'existe pas"); 
        }

        $entityManager = $this->getDoctrine()->getManager();
        $vessel->setIsActive(0);
        $entityManager->flush();

        $this->addFlash(
            'info',
            "Le navire " . $vessel->getCode() . ' a été supprimé !'
        );

        $referer = $request->headers->get('referer');
        return $this->redirect($referer);
    }
}
