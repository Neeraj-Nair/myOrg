@isTest
private class AccountListControllerTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test accounts
        List<Account> testAccounts = new List<Account>();
        
        for (Integer i = 1; i <= 10; i++) {
            testAccounts.add(new Account(
                Name = 'Test Account ' + i,
                BillingStreet = i + ' Test Street',
                BillingCity = 'Test City',
                BillingState = 'TS',
                BillingPostalCode = '1000' + i,
                BillingCountry = 'Test Country',
                AnnualRevenue = 100000 * i
            ));
        }
        
        insert testAccounts;
    }
    
    @isTest
    static void testGetRecentlyViewedAccounts_WithLimit5() {
        Test.startTest();
        List<Account> result = AccountListController.getRecentlyViewedAccounts(5);
        Test.stopTest();
        
        // Verify that up to 5 accounts are returned
        System.assert(result.size() <= 5, 'Should return at most 5 accounts');
        
        // Verify that required fields are populated
        for (Account acc : result) {
            System.assertNotEquals(null, acc.Name, 'Account Name should not be null');
            System.assertNotEquals(null, acc.Id, 'Account Id should not be null');
        }
    }
    
    @isTest
    static void testGetRecentlyViewedAccounts_WithLimit10() {
        Test.startTest();
        List<Account> result = AccountListController.getRecentlyViewedAccounts(10);
        Test.stopTest();
        
        // Verify that up to 10 accounts are returned
        System.assert(result.size() <= 10, 'Should return at most 10 accounts');
    }
    
    @isTest
    static void testGetRecentlyViewedAccounts_WithLimit15() {
        Test.startTest();
        List<Account> result = AccountListController.getRecentlyViewedAccounts(15);
        Test.stopTest();
        
        // Since we only have 10 test accounts, should return 10 or fewer
        System.assert(result.size() <= 10, 'Should return at most 10 accounts when only 10 exist');
    }
    
    @isTest
    static void testGetRecentlyViewedAccounts_NullLimit() {
        Test.startTest();
        List<Account> result = AccountListController.getRecentlyViewedAccounts(null);
        Test.stopTest();
        
        // Should default to 5 accounts
        System.assert(result.size() <= 5, 'Should default to at most 5 accounts when limit is null');
    }
    
    @isTest
    static void testGetRecentlyViewedAccounts_ZeroLimit() {
        Test.startTest();
        List<Account> result = AccountListController.getRecentlyViewedAccounts(0);
        Test.stopTest();
        
        // Should default to 5 accounts
        System.assert(result.size() <= 5, 'Should default to at most 5 accounts when limit is 0');
    }
    
    @isTest
    static void testGetRecentlyViewedAccounts_VerifyFields() {
        Test.startTest();
        List<Account> result = AccountListController.getRecentlyViewedAccounts(5);
        Test.stopTest();
        
        if (result.size() > 0) {
            // Verify that the first account has all expected fields
            Account firstAccount = result[0];
            System.assertNotEquals(null, firstAccount.Name, 'Name should not be null');
            System.assertNotEquals(null, firstAccount.BillingCity, 'BillingCity should not be null');
            System.assertNotEquals(null, firstAccount.BillingState, 'BillingState should not be null');
            System.assertNotEquals(null, firstAccount.AnnualRevenue, 'AnnualRevenue should not be null');
        }
    }
    
    @isTest
    static void testGetRecentlyViewedAccounts_IncludesNewlyCreated() {
        // Delete all existing accounts first
        delete [SELECT Id FROM Account];
        
        // Create a new account (won't have LastViewedDate initially)
        Account newAccount = new Account(
            Name = 'Newly Created Account',
            BillingStreet = '123 New Street',
            BillingCity = 'New City',
            BillingState = 'NC',
            BillingPostalCode = '12345',
            BillingCountry = 'USA',
            AnnualRevenue = 500000
        );
        insert newAccount;
        
        Test.startTest();
        List<Account> result = AccountListController.getRecentlyViewedAccounts(5);
        Test.stopTest();
        
        // Verify that the newly created account is returned
        System.assertEquals(1, result.size(), 'Should return the newly created account');
        System.assertEquals('Newly Created Account', result[0].Name, 'Should return the newly created account');
    }
}