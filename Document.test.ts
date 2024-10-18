import { expect } from 'chai';
import sinon from 'sinon';
import { Document } from '../src/domain/entities/Document';

describe('Document Entity', () => {
    let document: Document;
    const now = new Date();
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        // Install fake timers once for the test suite
        clock = sinon.useFakeTimers(now.getTime());
        document = new Document(
            '1',
            'testFile',
            'txt',
            'text/plain',
            ['tag1', 'tag2'],
            now,
            now,
            '/path/to/file'
        );
    });

    afterEach(() => {
        // Restore the original timers
        clock.restore();
    });

    it('should create a document with correct details', () => {
        expect(document.getId()).to.equal('1');
        expect(document.getFileName()).to.equal('testFile');
        expect(document.getFileExtension()).to.equal('txt');
        expect(document.getContentType()).to.equal('text/plain');
        expect(document.getTags()).to.deep.equal(['tag1', 'tag2']);
        expect(document.getCreatedAt().getTime()).to.be.closeTo(now.getTime(), 20); // Allow 20ms margin
        expect(document.getUpdatedAt().getTime()).to.be.closeTo(now.getTime(), 20); // Allow 20ms margin
        expect(document.getFilePath()).to.equal('/path/to/file');
    });

    it('should throw an error if ID is empty', () => {
        expect(() => new Document('', 'testFile', 'txt', 'text/plain')).to.throw('ID cannot be empty.');
    });

    it('should throw an error if file name is empty', () => {
        expect(() => new Document('1', '', 'txt', 'text/plain')).to.throw('File name cannot be empty.');
    });

    it('should throw an error if file extension is empty', () => {
        expect(() => new Document('1', 'testFile', '', 'text/plain')).to.throw('File extension cannot be empty.');
    });

    it('should throw an error if content type is empty', () => {
        expect(() => new Document('1', 'testFile', 'txt', '')).to.throw('Content type cannot be empty.');
    });

    it('should update file name and timestamp correctly', () => {
        document.updateFileName('newFileName');
        clock.tick(10);  // Move time forward by 10ms

        expect(document.getFileName()).to.equal('newFileName');
        expect(document.getUpdatedAt().getTime()).to.be.closeTo(now.getTime() + 10, 10); // Check with a tolerance
    });

    it('should update file extension and timestamp correctly', () => {
        document.updateFileExtension('pdf');
        clock.tick(10);

        expect(document.getFileExtension()).to.equal('pdf');
        expect(document.getUpdatedAt().getTime()).to.be.closeTo(now.getTime() + 10, 10);
    });

    it('should update content type and timestamp correctly', () => {
        document.updateContentType('application/pdf');
        clock.tick(10);

        expect(document.getContentType()).to.equal('application/pdf');
        expect(document.getUpdatedAt().getTime()).to.be.closeTo(now.getTime() + 10, 10);
    });

    it('should update tags and timestamp correctly', () => {
        document.updateTags(['tag3', 'tag4']);
        clock.tick(10);

        expect(document.getTags()).to.deep.equal(['tag3', 'tag4']);
        expect(document.getUpdatedAt().getTime()).to.be.closeTo(now.getTime() + 10, 10);
    });

    it('should set file path and update timestamp correctly', () => {
        document.setFilePath('/new/path/to/file');
        clock.tick(10);

        expect(document.getFilePath()).to.equal('/new/path/to/file');
        expect(document.getUpdatedAt().getTime()).to.be.closeTo(now.getTime() + 10, 10);
    });
});
