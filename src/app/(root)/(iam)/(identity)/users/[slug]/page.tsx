'use client'
import { useParams } from "next/navigation";
import React from "react";

const CurrentUser = () => {
  const { slug } = useParams();
  return <div>CurrentUser: {slug}</div>;
};

export default CurrentUser;
