'use client'
import React from 'react'
import {useParams} from "next/navigation";

const ApisPermissions = () => {
  const {role_uuid} = useParams()
  return (
    <div>ApisPermissions for role {role_uuid}</div>
  )
}

export default ApisPermissions