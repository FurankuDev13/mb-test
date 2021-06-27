<?php

namespace App\Form;

use App\Entity\Vessel;
use App\Entity\VesselType;
use App\Enum\VesselTypeEnum;
use App\Repository\VesselTypeRepository;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;

use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

use Doctrine\ORM\EntityManagerInterface;

class VesselFormType extends AbstractType
{
    private $em;
    
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $edit = !is_null($options['data']->getId()) ? true : false;

        $builder
            ->add('vesselType', EntityType::class, [
                'class' => VesselType::class,
                'attr' => ['class' => 'selectpicker vesselType-input'],
                'choice_label' => function($choice) {
                    $label = $choice->getLabel();
                    return $label;
                },
                'choice_attr' => function($choice) {

                    return ['data-id' => $choice->getId()];
                },
                'group_by' => function ($choice) {
                    return $choice->getParent() ? $choice->getParent()->getLabel() : "";
                },
                'query_builder' => function(VesselTypeRepository $entityRepo)
                {
                    $offensiveParentTypeId = VesselTypeEnum::OFFENSIVE;
                    $supportParentTypeId = VesselTypeEnum::SUPPORT;

                    $qb = $entityRepo->createQueryBuilder('en')                  
                        ->andWhere("en.isActive = 1")
                        ->andWhere("en.id != $offensiveParentTypeId")
                        ->andWhere("en.id != $supportParentTypeId")
                    ;

                    return $qb;
                },
                'required' => true,
                'label' => 'Type*'
            ])
            ->add('code', TextType::class, [
                'required' => true ,
                'label' => 'Code*',                   
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Vessel::class,
        ]);
    }
}
