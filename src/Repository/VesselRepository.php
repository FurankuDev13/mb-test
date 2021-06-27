<?php

namespace App\Repository;

use App\Entity\Vessel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Vessel|null find($id, $lockMode = null, $lockVersion = null)
 * @method Vessel|null findOneBy(array $criteria, array $orderBy = null)
 * @method Vessel[]    findAll()
 * @method Vessel[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class VesselRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Vessel::class);
    }

    public function getForTest($parentTypeId , $limit = 500) 
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = "SELECT vessel.id
                    , vessel.code
                    , vessel.vessel_type_id
                    , vessel_type.label AS vessel_type_label
                FROM mb_vessel vessel
                LEFT JOIN mb_vessel_type vessel_type ON vessel_type.id = vessel.vessel_type_id
                WHERE vessel.is_active = true
                AND vessel_type.parent_id = :parentTypeId
                ORDER BY vessel.vessel_type_id ASC
                LIMIT $limit
                ";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute(['parentTypeId' => $parentTypeId]);
        $results = $stmt->fetchAll();

        return $results;
    }

    // /**
    //  * @return Vessel[] Returns an array of Vessel objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('v.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Vessel
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
