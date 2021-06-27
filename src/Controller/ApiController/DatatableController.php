<?php

namespace App\Controller\ApiController;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use JMS\Serializer\SerializerBuilder;
use JMS\Serializer\SerializationContext;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @Route("/api/datatable", name="api_datatable_")
 */
class DatatableController extends AbstractController
{
    /**
     * @Route("/table", name="table", methods={"GET", "POST"})
     */
    public function table(Request $request, EntityManagerInterface $em)
    {
        // Params
        $sql = $request->request->get('sql', null);

        // Entity (table)
        $strpos = strpos($sql, "FROM");
        $substr = substr ($sql, $strpos);
        $explode = explode( ' ', $substr);
        $entity = $explode[1];

        return new Response(json_encode($entity), 200, ['Content-Type' => 'application/json']); 
    }

    /**
     * @Route("/columns", name="columns", methods={"GET", "POST"})
     */
    public function columns(Request $request, EntityManagerInterface $em)
    {
        
        // Params
        $sql = $request->request->get('sql', null);
        $table = $request->request->get('entity', null);
        
        $statement = $em->getConnection()->prepare($sql);
        $statement->execute();
        $result = $statement->fetch();
        if ($result) {
            $columns = array_keys($result);
        } else {
            $columns = false;
        }
        

        // Data Type
        if ($table && $columns) {
            $outpout = [];
            foreach($columns as $column) {
                $strpos = strpos($column, '-');
                if ($strpos) {
                    $outpout[$column] = "relation";
                } else {
                    $dataTypeSql = "SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" . $table . "' AND COLUMN_NAME = '" . $column . "' ";
                    $statement = $em->getConnection()->prepare($dataTypeSql);
                    $statement->execute();
                    $dataTypeResult = $statement->fetch();
                    $outpout[$column] = $dataTypeResult['DATA_TYPE'];
                } 
            }
        } else {
            $outpout = $columns;
        }

        return new Response(json_encode($outpout), 200, ['Content-Type' => 'application/json']); 
    }

    /**
     * @Route("/data", name="data", methods={"GET", "POST"})
     */
    public function data(Request $request, EntityManagerInterface $em)
    {
        // Params
        $draw = $request->request->get('draw', 1); 
        $start = $request->request->get('start', 0); 
        $length = $request->request->get('length', 10); 
        $length = $length == -1 ? 1000 : $length;
        
        $order = $request->request->get('order', null); 
        $dir = isset($sorting['dir']) ? $sorting['dir'] : "ASC" ;
        $column = isset($sorting['column']) ? $sorting['column'] : "id" ;

        $search = $request->request->get('search', null); 
        $value = isset($search['value']) ? $search['value'] : false ;
        $regex = isset($search['regex']) ? $search['regex'] : false ;
        
        $sql = $request->request->get('sql', null);
        $table = $request->request->get('entity', null);
        $columns = $request->request->get('columns', null);
        $extrafields = $request->request->get('extrafields', false);

        // Total 
        $statement = $em->getConnection()->prepare($sql);
        $statement->execute();
        $totalResults = $statement->fetchAll();
     
        // Recherche
        if ($search) {

            if (count($columns) > 2) {
                $sql .= " AND true IN ( ";
            }
            
            if ($extrafields && $extrafields != "") {
                foreach ($columns as $index => $columnData) {
                    if (array_key_exists($columnData['data'], $extrafields)) {
                        unset($columns[$index]);
                    }
                }
            }

            $limit = count($columns) - 2;
            $andWhere = "";
            
            foreach ($columns as $index => $columnData) {
  
                if ($columnData['data'] != "Actions" && $columnData['data'] != "") {
                    $strpos = strpos($columnData['data'], '-');
                    
                    if ($strpos) {
                        $explode = explode( '-', $columnData['data']);
                        $sql .= ' ' . $explode[0] . "." . $explode[1] . " LIKE '%" . $value . "%' ";
                    } else {
                        $sql .= ' ' . $table . "." . $columnData['data'] . " LIKE '%" . $value . "%' ";
                    }
                    
                    if ($index < $limit) {
                        $sql .= " , ";
                    } else {
                        $sql .= " ) ";
                    }
                } 

                $columnSearch = isset($columnData['search']) ? $columnData['search'] : false ;
                $columnValue = isset($columnSearch['value']) ? $columnSearch['value'] : false ;
                $columnValueRegex = isset($columnSearch['regex']) ? $columnSearch['regex'] : false ;

                if ($columnValue) {
                    if ($strpos) {
                        $andWhere .= ' AND ' . $explode[0] . "." . $explode[1] . " LIKE '%" . $columnValue . "%' "; 
                    } else {
                        $andWhere .= ' AND ' . $table . "." . $columnData['data'] . " LIKE '%" . $columnValue . "%' "; 
                    }
                    
                } 
            }

            if ($regex != "false") {
                $andWhere .= ' AND ' . $regex; 
            } 

            $sql .= $andWhere;
        }

        // Tri
        if ($order) {
            $sql .= " ORDER BY " . $column . "  " . $dir . " ";
        }

        // Total filtered
        $statement = $em->getConnection()->prepare($sql);
        $statement->execute();
        $totalFiltered = $statement->fetchAll();

        // Limite & Offset
        $sql .= " LIMIT " . $length . " OFFSET " . $start . " ";

        // Requête
        $statement = $em->getConnection()->prepare($sql);
        $statement->execute();
        $results = $statement->fetchAll();

        // Extrafields
        if ($extrafields && $extrafields != "") {

            foreach ($results as $index => $result) {
    
                foreach($extrafields as $key => $extrafield) {
                    $subSql = " SELECT " . " $extrafield ";
                    $subSql .= " FROM " . $key . " " . $key . " ";

                    $strpos = strpos($extrafield, '.');

                    if ($strpos) {
                        $explode = explode( '.', $extrafield);

                        if ($strposTable = strpos($explode[0], '_')) {
                            $exploded = explode( '_', $explode[0], 2);
                            $joinedTable = $exploded[1];
                        } else {
                            $joinedTable = $explode[0];
                        }

                        $subSql .= " LEFT JOIN " . $explode[0] . " " . $explode[0] . " ON  " . $key . "." . $joinedTable . "_id = " . $explode[0] . ".id "  ;

                        if ($strposTable = strpos($table, '_')) {
                            $exploded = explode( '_', $table, 2);
                            $table = $exploded[1];
                        } 

                        $subSql .= " WHERE " . $key . "." . $table . "_id  = " . $result['id'];
                    }

                    $statement = $em->getConnection()->prepare($subSql);
                    $statement->execute();
                    $results[$index][$key] = $statement->fetchAll();
                }
                
            }
        }

        // Réponse
        $output = array( 
            'draw' => $draw,
            'recordsTotal' => count($totalResults),
            'recordsFiltered' => count($totalFiltered),
            'data' => $results, 
        ); 

        return new Response(json_encode($output), 200, ['Content-Type' => 'application/json']); 
    }

    /**
     * @Route("/data/related", name="data_related", methods={"GET", "POST"})
     */
    public function dataRelated(Request $request, EntityManagerInterface $em)
    {
        // Params
        $column = $request->request->get('column'); 
        $table = $request->request->get('entity');

        $strpos = strpos($column, '-');
                    
        if ($strpos) {
            $explode = explode( '-', $column);
            $column = $explode[1];
            $table = $explode[0];
            $sql = ' SELECT id, ' . $explode[1] . ' FROM ' . $explode[0] . " ";
        }

        $sql = ' SELECT id, ' . $column . ' FROM ' . $table . " ";

        // Requête
        $statement = $em->getConnection()->prepare($sql);
        $statement->execute();
        $results = $statement->fetchAll();

        $output = [];
        foreach ($results as $result) {
            $output[$result['id']] = $result[$column];
        }

        return new Response(json_encode($output), 200, ['Content-Type' => 'application/json']); 
    }

    /**
     * @Route("/data/{id}/update", name="data_update", methods={"PUT"})
     */
    public function dataUpdate(Request $request, $id, EntityManagerInterface $em)
    {
        // Params
        $column = $request->request->get('column'); 
        $value = $request->request->get('value'); 
        $table = $request->request->get('entity'); 

        $strpos = strpos($column, '-');
                    
        if ($strpos) {
            $relatedTest = true;
            $explode = explode( '-', $column);
            $column = $explode[0];
        } else {
            $relatedTest = false;
        }

        $strtotime = strtotime($value);

        if ($strtotime) {
            $dateValue = new \DateTime($value);
            $value = $dateValue->format('Y-m-d H:i:s');
        }

        $strposTable = strpos($table, '_');

        if ($strposTable) {
            $explode = explode( '_', $table, 2);
            $table = $explode[1];
        }

        $strposColumn = strpos($column, '_');
        
        if ($strposColumn && $relatedTest) {
            $explode = explode( '_', $column, 2);
            $column = $explode[1];
        }

        $formattedColumn =lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $column))));
        $formattedTable =ucfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $table))));

        $queryBuilder = $em->createQueryBuilder();
      
        $queryBuilder->update('App\Entity\\' . $formattedTable, $table)
            ->set($table . "." . $formattedColumn, "'" . $value . "'")
            ->where($table . '.id = ' . $id)
        ;

        $query = $queryBuilder->getQuery();
        $query->getDQL();
        $query->execute();
        
        return new Response(json_encode($value), 200, ['Content-Type' => 'application/json']);
    }
}
