'use client'

import React from "react";
import {useParams} from "next/navigation";

const SectionComponents = () => {
  const {role_uuid} = useParams()
  return <div>Section Components Permissions for role {role_uuid}</div>;
};

export default SectionComponents;
