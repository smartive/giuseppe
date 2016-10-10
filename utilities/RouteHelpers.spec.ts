import { VersionInformation } from '../models/VersionInformation';
import { doRouteVersionsOverlap } from './RouteHelpers';
import 'reflect-metadata';
import chai = require('chai');

chai.should();

describe('RouteHelper', () => {

    describe('doRouteVersionsOverlap()', () => {

        it('should return false on: 1-3 | 4-5', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 1, until: 3 }),
                VersionInformation.create('', { from: 4, until: 5 })
            ).should.be.false;
        });

        it('should return false on: 4-5 | 1-3', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 4, until: 5 }),
                VersionInformation.create('', { from: 1, until: 3 })
            ).should.be.false;
        });

        it('should return false on: -3 | 4-5', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { until: 3 }),
                VersionInformation.create('', { from: 4, until: 5 })
            ).should.be.false;
        });

        it('should return false on: 4-5 | -3', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 4, until: 5 }),
                VersionInformation.create('', { until: 3 })
            ).should.be.false;
        });

        it('should return false on: 1-3 | 4-', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 1, until: 3 }),
                VersionInformation.create('', { from: 4 })
            ).should.be.false;
        });

        it('should return false on: 4- | 1-3', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 4 }),
                VersionInformation.create('', { from: 1, until: 3 })
            ).should.be.false;
        });

        it('should return false on: 3- | -2', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 3 }),
                VersionInformation.create('', { until: 2 })
            ).should.be.false;
        });

        it('should return true on: 1-3 | 1-3', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 1, until: 3 }),
                VersionInformation.create('', { from: 1, until: 3 })
            ).should.be.true;
        });

        it('should return true on: 1-5 | 1-3', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 1, until: 5 }),
                VersionInformation.create('', { from: 1, until: 3 })
            ).should.be.true;
        });

        it('should return true on: 1-3 | 2-3', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 1, until: 3 }),
                VersionInformation.create('', { from: 2, until: 3 })
            ).should.be.true;
        });

        it('should return true on: 1-5 | 4-7', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 1, until: 5 }),
                VersionInformation.create('', { from: 4, until: 7 })
            ).should.be.true;
        });

        it('should return true on: 1-5 | 2-2', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 1, until: 5 }),
                VersionInformation.create('', { from: 2, until: 2 })
            ).should.be.true;
        });

        it('should return true on: 1-1 | 1-1', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 1, until: 1 }),
                VersionInformation.create('', { from: 1, until: 1 })
            ).should.be.true;
        });

        it('should return true on: -3 | 3-3', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { until: 3 }),
                VersionInformation.create('', { from: 1, until: 3 })
            ).should.be.true;
        });

        it('should return true on: -5 | 4-7', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { until: 5 }),
                VersionInformation.create('', { from: 4, until: 7 })
            ).should.be.true;
        });

        it('should return true on: 3- | 1-4', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 3 }),
                VersionInformation.create('', { from: 1, until: 4 })
            ).should.be.true;
        });

        it('should return true on: 3- | -4', () => {
            doRouteVersionsOverlap(
                VersionInformation.create('', { from: 3 }),
                VersionInformation.create('', { until: 4 })
            ).should.be.true;
        });

    });

});
