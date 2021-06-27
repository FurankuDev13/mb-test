* Configurer le .env pour la BDD

* Micro-données pour vessel_type

```
INSERT INTO mb_vessel_type (parent_id,label,code,medical_unit_count,canon_count,is_active,created_at,updated_at) VALUES 
(NULL,'Offensive','OFF',0,0,1,NULL,NULL)
,(NULL,'Support','SUP',1,6,1,NULL,NULL)
,(NULL,'Command','COM',0,0,1,NULL,NULL)
,(2,'Refueling','FUEL',1,0,1,NULL,NULL)
,(2,'Mechanical Assistance','MECH',1,0,1,NULL,NULL)
,(2,'Cargo','CARG',1,0,1,NULL,NULL)
,(1,'Battleship','BATT',0,24,1,NULL,NULL)
,(1,'Destroyer','DEST',0,12,1,NULL,NULL)
,(1,'Cruiser','CRUI',0,6,1,NULL,NULL)
;
```