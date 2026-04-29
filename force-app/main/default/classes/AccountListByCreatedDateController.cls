public with sharing class AccountListByCreatedDateController {
    
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountsByCreatedDate(Integer recordLimit) {
        try {
            if (recordLimit == null || recordLimit <= 0) {
                recordLimit = 5;
            }
            
            String fieldSetQuery = FieldSetHelper.getFieldSetQuery('Account', 'AccountListFields');
            
            if (String.isBlank(fieldSetQuery)) {
                // Fallback to default fields if field set not found
                fieldSetQuery = 'Id, Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry, AnnualRevenue, CreatedDate';
            }
            
            String query = 'SELECT ' + fieldSetQuery + ' FROM Account ORDER BY CreatedDate DESC LIMIT :recordLimit';
            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching accounts: ' + e.getMessage());
        }
    }
}