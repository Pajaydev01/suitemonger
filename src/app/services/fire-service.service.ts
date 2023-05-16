import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { Firestore, collection, collectionData, doc, docData, addDoc, deleteDoc, updateDoc, setDoc, getDocs, query, where, orderBy } from '@angular/fire/firestore';
import { Storage, list, listAll, uploadString, uploadBytes, getStorage, ref, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable } from 'rxjs';
export interface Note {
  id?: string;
  title: string;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class FireServiceService {

  constructor(
    private firestore: Firestore,
    private storage: Storage,
  ) {
  }

  //to get all items in a collection
  getAll(table): Observable<Note[]> {
    const notesRef = collection(this.firestore, table);
    return collectionData(notesRef, { idField: 'id' }) as Observable<Note[]>;
  }

  //filter through one colections search
  queryData(table, column, name, order: any = '', by: any = '') {
    if (by != '') {
      const que = query(collection(this.firestore, table), where(column, "==", name), orderBy(order, by));
      return getDocs(que);
    }
    else {
      const que = query(collection(this.firestore, table), where(column, "==", name))
      return getDocs(que)
    }
  }

  //to save items in a collection
  save(note, table) {
    //  const notesRef = collection(this.firestore, table);
    let docy = doc(this.firestore, table);
    //return addDoc(notesRef, note);
    let save = setDoc(docy, note)
    return setDoc(docy, note);
  }

  //get a single collection
  getSingle(table, id): Observable<any> {
    const noteDocRef = doc(this.firestore, `${table}/${id}`);
    return docData(noteDocRef, { idField: 'id' }) as Observable<any>;
  }

  //delete a single collection
  deleteNote(id, table) {
    const noteDocRef = doc(this.firestore, `${table}/${id}`);
    return deleteDoc(noteDocRef);
  }

  //update collection record
  updateNote(id, data, table) {
    const noteDocRef = doc(this.firestore, `${table}/${id}`);
    return updateDoc(noteDocRef, data);
  }

  // for uplaading
  uploadFile(base64, metadata, n) {
    const upload = ref(this.storage, `uploads/${n}`);
    return uploadString(upload, base64, 'base64', metadata);
  }

  //retrieve file
  getFIle(path) {
    const paths = ref(this.storage, path);
    const resp = getDownloadURL(paths)
    return resp;
  }

  getUrl(ref) {
    const resp = getDownloadURL(ref)
    return resp;
  }

  //for deleting file
  delFile(path) {
    const paths = ref(this.storage, path);
    const resp = deleteObject(paths)
    return resp;
  }
}
