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
define(["./defined-b9ff0e39","./Check-e6691f86","./freezeObject-2d5b18ce","./defaultValue-199f5aa8","./Math-92bd3539","./Cartesian2-8fa798b8","./defineProperties-ae15c9d5","./Transforms-9a355f42","./RuntimeError-d5522ee3","./WebGLConstants-554ddbe2","./ComponentDatatype-569c1e3e","./GeometryAttribute-27490d00","./when-c208a7cf","./GeometryAttributes-c3465b51","./AttributeCompression-4cb3e905","./GeometryPipeline-6c73aaa9","./EncodedCartesian3-e4976669","./IndexDatatype-7119db15","./IntersectionTests-dd6b2930","./Plane-c76671c4","./GeometryInstance-4fcf764c","./arrayRemoveDuplicates-1efed288","./EllipsoidTangentPlane-2b3e2af5","./OrientedBoundingBox-c2625c9c","./CoplanarPolygonGeometryLibrary-450660ab","./ArcType-c72d871a","./EllipsoidRhumbLine-fb5cc30d","./PolygonPipeline-003684d7","./PolygonGeometryLibrary-d556c85b"],function(a,e,t,i,r,l,n,p,o,y,s,u,c,d,m,f,b,g,h,P,G,v,L,C,T,E,k,H,w){"use strict";function A(e){for(var t=e.length,r=new Float64Array(3*t),n=g.IndexDatatype.createTypedArray(t,2*t),o=0,a=0,i=0;i<t;i++){var y=e[i];r[o++]=y.x,r[o++]=y.y,r[o++]=y.z,n[a++]=i,n[a++]=(i+1)%t}var c=new d.GeometryAttributes({position:new u.GeometryAttribute({componentDatatype:s.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:r})});return new u.Geometry({attributes:c,indices:n,primitiveType:u.PrimitiveType.LINES})}function I(e){var t=(e=i.defaultValue(e,i.defaultValue.EMPTY_OBJECT)).polygonHierarchy;this._polygonHierarchy=t,this._workerName="createCoplanarPolygonOutlineGeometry",this.packedLength=w.PolygonGeometryLibrary.computeHierarchyPackedLength(t)+1}I.fromPositions=function(e){return new I({polygonHierarchy:{positions:(e=i.defaultValue(e,i.defaultValue.EMPTY_OBJECT)).positions}})},I.pack=function(e,t,r){return r=i.defaultValue(r,0),t[r=w.PolygonGeometryLibrary.packPolygonHierarchy(e._polygonHierarchy,t,r)]=e.packedLength,t};var _={polygonHierarchy:{}};return I.unpack=function(e,t,r){t=i.defaultValue(t,0);var n=w.PolygonGeometryLibrary.unpackPolygonHierarchy(e,t);t=n.startingIndex,delete n.startingIndex;var o=e[t];return a.defined(r)||(r=new I(_)),r._polygonHierarchy=n,r.packedLength=o,r},I.createGeometry=function(e){var t=e._polygonHierarchy,r=t.positions;if(!((r=v.arrayRemoveDuplicates(r,l.Cartesian3.equalsEpsilon,!0)).length<3)&&T.CoplanarPolygonGeometryLibrary.validOutline(r)){var n=w.PolygonGeometryLibrary.polygonOutlinesFromHierarchy(t,!1);if(0!==n.length){for(var o=[],a=0;a<n.length;a++){var i=new G.GeometryInstance({geometry:A(n[a])});o.push(i)}var y=f.GeometryPipeline.combineInstances(o)[0],c=p.BoundingSphere.fromPoints(t.positions);return new u.Geometry({attributes:y.attributes,indices:y.indices,primitiveType:y.primitiveType,boundingSphere:c})}}},function(e,t){return a.defined(t)&&(e=I.unpack(e,t)),e._ellipsoid=l.Ellipsoid.clone(e._ellipsoid),I.createGeometry(e)}});
