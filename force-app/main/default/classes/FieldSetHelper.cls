public with sharing class FieldSetHelper {
    
    // Wrapper class to make FieldSetMember data serializable for LWC
    public class FieldSetMemberWrapper {
        @AuraEnabled public String label { get; set; }
        @AuraEnabled public String fieldPath { get; set; }
        @AuraEnabled public String type { get; set; }
        @AuraEnabled public Boolean required { get; set; }
        @AuraEnabled public String dbRequired { get; set; }
        
        public FieldSetMemberWrapper(Schema.FieldSetMember fsm) {
            this.label = fsm.getLabel();
            this.fieldPath = fsm.getFieldPath();
            this.type = String.valueOf(fsm.getType());
            this.required = fsm.getRequired();
            this.dbRequired = String.valueOf(fsm.getDbRequired());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<FieldSetMemberWrapper> getFieldSetMembers(String objectName, String fieldSetName) {
        List<FieldSetMemberWrapper> fieldSetMembers = new List<FieldSetMemberWrapper>();
        
        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectName);
        if (sObjectType == null) {
            return fieldSetMembers;
        }
        
        Schema.DescribeSObjectResult describeResult = sObjectType.getDescribe();
        Map<String, Schema.FieldSet> fieldSetMap = describeResult.fieldSets.getMap();
        
        if (!fieldSetMap.containsKey(fieldSetName)) {
            return fieldSetMembers;
        }
        
        Schema.FieldSet fieldSet = fieldSetMap.get(fieldSetName);
        
        for (Schema.FieldSetMember fieldSetMember : fieldSet.getFields()) {
            fieldSetMembers.add(new FieldSetMemberWrapper(fieldSetMember));
        }
        
        return fieldSetMembers;
    }
    
    @AuraEnabled(cacheable=true)
    public static String getFieldSetQuery(String objectName, String fieldSetName) {
        List<String> fields = new List<String>{'Id'};
        
        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectName);
        if (sObjectType == null) {
            return '';
        }
        
        Schema.DescribeSObjectResult describeResult = sObjectType.getDescribe();
        Map<String, Schema.FieldSet> fieldSetMap = describeResult.fieldSets.getMap();
        
        if (!fieldSetMap.containsKey(fieldSetName)) {
            return '';
        }
        
        Schema.FieldSet fieldSet = fieldSetMap.get(fieldSetName);
        
        for (Schema.FieldSetMember fieldSetMember : fieldSet.getFields()) {
            fields.add(fieldSetMember.getFieldPath());
        }
        
        return String.join(fields, ', ');
    }
}