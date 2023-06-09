INSERT INTO parent_groups (parent_group_id,parent_group,status, used_in_project) VALUES
('LG100-4','Chem_DrugTox_Chal_Sero_Allergy<SAME:Comp|Prop|Tm|Syst (except intravascular and urine)><ANYBldSerPlas,ANYUrineUrineSed><ROLLUP:Method>','ACTIVE', false),
('LG103-8','ReportableMicroViruses<SAME:Virus><ROLLUP:everything else>','ACTIVE', false),
('LG105-3','ReportableMicroNon-virus<SAME:Genus+species><ROLLUP:everything else>','ACTIVE', false),
('LG106-1','ReportableMicroNon-virus<SAME:Genus><ROLLUP:everything else>','ACTIVE', false),
('LG27-5','CellDiffCount<SAME:Comp|Prop|Tm|Sys><ROLLUP:Meth>','ACTIVE', false),
('LG41751-5','ExerciseOrActivityTerms','ACTIVE', false),
('LG41762-2','SocialDeterminantsOfHealth','ACTIVE', false),
('LG41808-3','RadRegion:Abdomen','ACTIVE', false),
('LG41809-1','RadRegion:Head','ACTIVE', false),
('LG41811-7','RadRegion:Neck','ACTIVE', false),
('LG41812-5','RadRegion:Chest','ACTIVE', false),
('LG41813-3','RadRegion:Pelvis','ACTIVE', false),
('LG41814-1','RadRegion:LowerExtremity','ACTIVE', false),
('LG41816-6','RadRegion:UpperExtremity','ACTIVE', false),
('LG41817-4','RadRegion:Extremity','ACTIVE', false),
('LG41818-2','RadRegion:WholeBody','ACTIVE', false),
('LG41820-8','RadRegion:Unspecified(XXX)','ACTIVE', false),
('LG41821-6','RadRegion:Breast','ACTIVE', false),
('LG41822-4','DocOnt<SAME:Setting><ROLLUP:TypeOfService|KindOfDocument|SMD|Role>','ACTIVE', false),
('LG41855-4','SmokingStatus','ACTIVE', false),
('LG47-3','VitalsRoutine<SAME:Comp|Prop><Tm:Pt|Chal:None><ROLLUP:Sys|Meth>','ACTIVE', false),
('LG50067-4','FetalBodyWeight<SAME:Comp|Prop|Tm|System><ROLLUP:Meth>','ACTIVE', false),
('LG50107-8','Smoking biochemical markers','ACTIVE', false),
('LG50109-4','FetalGestationalAge<SAME:Prop|Tm|Sys><ROLLUP:Meth>','ACTIVE', false),
('LG50110-2','DeliveryDate<SAME:Comp|Prop|Tm|Sys><ROLLUP:Meth>','ACTIVE', false),
('LG50140-9','PregnancyTests[Ser/Plas and Urine]','ACTIVE', false),
('LG50907-1','MicroEYE<SAME:Comp|Prop|Tm><Sys:ANYEYE><ROLLUP:Meth>','ACTIVE', false),
('LG51014-5','SARSCoV2 virus detection','ACTIVE', false),
('LG51015-2','SARSCoV2 antibody detection','ACTIVE', false),
('LG51016-0','SARSCoV2 molecular detection','ACTIVE', false),
('LG55-6','MassMolConc<SAME:Comp|Tm|Sys|Meth><Prop:MCncORSCnc>','ACTIVE', false),
('LG66-3','MicroResp<SAME:Comp|Prop|Tm><Sys:ANYResp><ROLLUP:Meth>','ACTIVE', false),
('LG68-9','MicroGU<SAME:Comp|Prop|Tm><Sys:ANYGU><ROLLUP:Meth>','ACTIVE', false),
('LG70-5','BodyMeasurementsRoutine<SAME:Comp|Prop|Tm|Sys><ROLLUP:Meth>','ACTIVE', false),
('LG74-7','Urine<SAME:Comp|Prop|Sys><ROLLUP:Tm|Meth>','ACTIVE', false),
('LG78-8','UrineMicroalbumin<SAME:Comp|Prop|Sys><ROLLUP:Tm|Meth>','ACTIVE', false),
('LG80-4','Drug/ToxPotentialForAbuse<SAME:Comp><ROLLUP:Prop|Tm|Sys|Meth>','ACTIVE', false),
('LG85-3','RadExtremityWithFocus<SAME:Meth|ImagingFocus|Comp><ROLLUP:Laterality>','ACTIVE', false),
('LG88-7','RadBreast<SAME:Meth|ImagingFocus|Comp><ROLLUP:Laterality>','ACTIVE', false),
('LG89-5','RadKidney<SAME:Meth|Comp><ROLLUP:Laterality>','ACTIVE', false),
('LG90-3','DocOnt<SAME:TypeOfService|KindOfDocument><ROLLUP:Setting|SMD|Role>','ACTIVE', false),
('LG92-9','DocOnt<SAME:Role|SMD><ROLLUP:TypeOfService|KindOfDocument|Setting>','ACTIVE', false),
('LG96-0','RadExtremityWOFocus<SAME:Meth|Comp><ROLLUP:Laterality>','ACTIVE', false),
('LG97-8','UrineAndSed<SAME:Comp><Sys:ANYUrineUrineSed><ROLLUP:Tm|Prop|Method>','ACTIVE', false),
('LG99-4','IsolateSusc<SAME:Comp|Sys><ROLLUP:Tm|Prop|Method>','ACTIVE', false)
