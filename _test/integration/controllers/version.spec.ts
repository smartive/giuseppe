// // TODO.


// it.only('should route a version number to a controller', () => {
//             @Controller()
//             @Version({ from: 1 })
//             class Ctrl {
//                 @Get()
//                 public func(): string {
//                     return 'hello version 1';
//                 }
//             }

//             registerControllers('', router);


//         });

//         it('should route a version number to a route');

//         it('should route a version to the correct controller');

//         it('should route a version to the correct route');

//         it('should add a version info (from: 1) to a non versioned element');

//         it('should use the correct non versioned route');

//         it('should use the correct non versioned controller');

//         it('should correctly map header to v1 if header is not provided');

//         it('should use the correct controller (from)');

//         it('should use the correct controller (until)');

//         it('should use the correct controller (from / until)');

//         it('should use the correct route (from)');

//         it('should use the correct route (until)');

//         it('should use the correct route (from / until)');

//         it('should not throw when registering the same route with different versions');

//         it('should throw when 2 routes overlap with versions (1-3 | 2-4)', () => {
//             (() => {
//                 @Controller()
//                 class Ctrl {
//                     @Get()
//                     @Version({ from: 1, until: 3 })
//                     public func(): string {
//                         return 'hello version 1';
//                     }

//                     @Get()
//                     @Version({ from: 2, until: 4 })
//                     public func2(): string {
//                         return 'hello version 1';
//                     }
//                 }

//                 registerControllers('', router);
//             }).should.throw(DuplicateRouteDeclarationError);
//         });

//         it('should throw when 2 routes overlap with versions (-3 | 2-)', () => {
//             (() => {
//                 @Controller()
//                 class Ctrl {
//                     @Get()
//                     @Version({ until: 3 })
//                     public func(): string {
//                         return 'hello version 1';
//                     }

//                     @Get()
//                     @Version({ from: 2 })
//                     public func2(): string {
//                         return 'hello version 1';
//                     }
//                 }

//                 registerControllers('', router);
//             }).should.throw(DuplicateRouteDeclarationError);
//         });

//         it('should throw when 2 routes overlap with versions (1-10 | 2-4)', () => {
//             (() => {
//                 @Controller()
//                 class Ctrl {
//                     @Get()
//                     @Version({ from: 1, until: 10 })
//                     public func(): string {
//                         return 'hello version 1';
//                     }

//                     @Get()
//                     @Version({ from: 2, until: 4 })
//                     public func2(): string {
//                         return 'hello version 1';
//                     }
//                 }

//                 registerControllers('', router);
//             }).should.throw(DuplicateRouteDeclarationError);
//         });

//         it('should throw when 2 routes overlap with versions (1- | 2-)', () => {
//             (() => {
//                 @Controller()
//                 class Ctrl {
//                     @Get()
//                     @Version({ from: 1 })
//                     public func(): string {
//                         return 'hello version 1';
//                     }

//                     @Get()
//                     @Version({ from: 2 })
//                     public func2(): string {
//                         return 'hello version 1';
//                     }
//                 }

//                 registerControllers('', router);
//             }).should.throw(DuplicateRouteDeclarationError);
//         });

//         it('should throw when 2 routes overlap with versions (-3 | -4)', () => {
//             (() => {
//                 @Controller()
//                 class Ctrl {
//                     @Get()
//                     @Version({ until: 3 })
//                     public func(): string {
//                         return 'hello version 1';
//                     }

//                     @Get()
//                     @Version({ until: 4 })
//                     public func2(): string {
//                         return 'hello version 1';
//                     }
//                 }

//                 registerControllers('', router);
//             }).should.throw(DuplicateRouteDeclarationError);
//         });

//         it('should throw if a route is not available in a certain version');

//         it('should prefer route version over controller version (from)');

//         it('should prefer route version over controller version (until)');

//         it('should prefer route version over controller version (from / until)');