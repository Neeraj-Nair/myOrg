public with sharing class AccountListController {
    
    @AuraEnabled(cacheable=true)
    public static List<Account> getRecentlyViewedAccounts(Integer recordLimit) {
        try {
            if (recordLimit == null || recordLimit <= 0) {
                recordLimit = 5;
            }
            
            String fieldSetQuery = FieldSetHelper.getFieldSetQuery('Account', 'AccountListFields');
            
            if (String.isBlank(fieldSetQuery)) {
                // Fallback to default fields
                fieldSetQuery = 'Id, Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry, AnnualRevenue, LastViewedDate, CreatedDate';
            } else {
                // Add LastViewedDate if not in field set
                if (!fieldSetQuery.containsIgnoreCase('LastViewedDate')) {
                    fieldSetQuery += ', LastViewedDate';
                }
            }
            
            // Get accounts with LastViewedDate
            String query = 'SELECT ' + fieldSetQuery + ' FROM Account WHERE LastViewedDate != null ORDER BY LastViewedDate DESC LIMIT :recordLimit';
            List<Account> viewedAccounts = Database.query(query);
            
            // If we don't have enough viewed accounts, supplement with recently created ones
            if (viewedAccounts.size() < recordLimit) {
                Set<Id> existingIds = new Set<Id>();
                for (Account acc : viewedAccounts) {
                    existingIds.add(acc.Id);
                }
                
                Integer remainingLimit = recordLimit - viewedAccounts.size();
                String supplementQuery = 'SELECT ' + fieldSetQuery + ' FROM Account WHERE Id NOT IN :existingIds ORDER BY CreatedDate DESC LIMIT :remainingLimit';
                List<Account> recentAccounts = Database.query(supplementQuery);
                
                viewedAccounts.addAll(recentAccounts);
            }
            
            return viewedAccounts;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching accounts: ' + e.getMessage());
        }
    }
}