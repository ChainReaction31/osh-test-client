/**
 * Cesium - https://github.com/AnalyticalGraphicsInc/cesium
 *
 * Copyright 2011-2017 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/AnalyticalGraphicsInc/cesium/blob/master/LICENSE.md for full licensing details.
 */
define(["./defined-b9ff0e39","./Check-e6691f86","./freezeObject-2d5b18ce","./defaultValue-199f5aa8","./Math-92bd3539","./Cartesian2-8fa798b8","./defineProperties-ae15c9d5","./Transforms-9a355f42","./RuntimeError-d5522ee3","./WebGLConstants-554ddbe2","./ComponentDatatype-569c1e3e","./GeometryAttribute-27490d00","./when-c208a7cf","./GeometryAttributes-c3465b51","./IndexDatatype-7119db15","./GeometryOffsetAttribute-0abfa3f6","./EllipseGeometryLibrary-3fd7791c","./EllipseOutlineGeometry-f43d081d"],function(r,e,t,i,n,a,d,f,l,o,c,s,u,b,p,m,y,G){"use strict";return function(e,t){return r.defined(t)&&(e=G.EllipseOutlineGeometry.unpack(e,t)),e._center=a.Cartesian3.clone(e._center),e._ellipsoid=a.Ellipsoid.clone(e._ellipsoid),G.EllipseOutlineGeometry.createGeometry(e)}});
