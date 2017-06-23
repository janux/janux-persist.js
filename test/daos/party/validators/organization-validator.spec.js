/**
 * Project janux-persistence
 * Created by ernesto on 6/22/17.
 */
var chai = require('chai');
var expect = chai.expect;
//Config files
var OrganizationEntity = require("../../../../dist/index").OrganizationEntity;
var OrganizationValidator= require("../../../../dist/index").OrganizationValidator;

const name = "Glarus";

describe("Testing organization validator", function () {
    describe("When validating with empty name", function(){
        it("The method should return an error",function(){
            var organization = new OrganizationEntity();
            organization.name = "  ";
            var errors = OrganizationValidator.validateOrganization(organization);
            expect(errors.length).eq(1);
            expect(errors[0].attribute).eq(OrganizationValidator.NAME);
            expect(errors[0].message).eq(OrganizationValidator.NAME_EMPTY);
        });
    });


    describe("When validating with a valid name", function(){
        it("The method should not return an error",function(){
            var organization = new OrganizationEntity();
            organization.name = name;
            var errors = OrganizationValidator.validateOrganization(organization);
            expect(errors.length).eq(0);
        });
    });
});
