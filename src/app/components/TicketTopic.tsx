"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Image,
  Avatar,
  Divider,
  CardFooter,
  RadioGroup,
  Radio,
  cn,
  Progress,
} from "@nextui-org/react";
import { useAuth } from "@clerk/nextjs";
import { Record } from "@/util/type";

interface Props {
  id?: string;
  userId?: string;
  avatar?: string;
  content?: string;
  images?: string[];
  options: Array<{ key: string; value: number }>;
}

function TicketTopic(props: Props) {
  const [count, setCount] = useState(
    props.options.reduce((acc, item) => acc + item.value, 0)
  );
  const [selectedChoice, setSelectedChoice] = useState("");
  const [isVote, setIsVote] = useState(false);
  const [record, setRecord] = useState<Record>();
  const [options, setOptions] = useState<typeof props.options>(props.options);

  const { userId } = useAuth();

  useEffect(() => {
    const fetchIsVote = async () => {
      const result = await fetch(
        `${process.env.API_ADDRESS}/topic/record?userId=${userId}&topicId=${props.id}`,
        {
          method: "GET",
          cache: "no-cache",
        }
      );
      if (result.status === 200) {
        const data = await result.json();
        const record = data.record as Record;
        setIsVote(true);
        setRecord(record);
        setSelectedChoice(record.choice);
      }
    };
    fetchIsVote();
  }, [props.id, userId]);

  return (
    <>
      <div className="w-10/12">
        <Card>
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-center">
            <Avatar src={props.avatar} />
            <h4 className=" text-lg font-bold">
              {props.userId?.substring(0, 8)}
            </h4>
            <p className="text-lg font-semibold">{props.content}</p>
          </CardHeader>
          <CardBody className="overflow-visible py-2 px-4 flex flex-row justify-center">
            {props.images &&
              props.images.map((image, index) => (
                <Image
                  key={index}
                  alt="Card iamge"
                  className="object-cover rounded-xl my-1 mx-1"
                  src={image}
                  width={270}
                />
              ))}
          </CardBody>
          <CardFooter className="px-4 py-2 flex flex-col justify-stretch">
            <RadioGroup
              orientation="horizontal"
              value={selectedChoice}
              onValueChange={async (value) => {
                const newOptions = options.map((item) => {
                  if (item.key === value) {
                    return {
                      key: item.key,
                      value: item.value + 1,
                    };
                  }
                  if (item.key === selectedChoice) {
                    return {
                      key: item.key,
                      value: item.value - 1,
                    };
                  }
                  return item;
                });
                setOptions(newOptions);
                if (selectedChoice === "") setCount(count + 1);
                setSelectedChoice(value);
                const result = await fetch(
                  `${process.env.API_ADDRESS}/topic/record`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      topicId: props.id,
                      userId: userId,
                      choice: value,
                    }),
                  }
                );
                if (result.status === 200) setIsVote(true);
              }}
            >
              {props.options &&
                props.options.map((item) => {
                  return (
                    <Radio
                      key={item.key}
                      value={item.key}
                      className={cn(
                        "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                        "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
                        "data-[selected=true]:border-primary"
                      )}
                    >
                      {item.key}
                    </Radio>
                  );
                })}
            </RadioGroup>
            {isVote &&
              options?.map((item) => {
                return (
                  <Progress
                    key={item.key}
                    size="sm"
                    radius="sm"
                    classNames={{
                      base: "max-w-md",
                      track: "drop-shadow-md border border-default",
                      indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
                      label: "tracking-wider font-medium text-default-600",
                      value: "text-foreground/60",
                    }}
                    label={item.key}
                    value={count === 0 ? 0 : (item.value / count) * 100}
                    showValueLabel={true}
                  />
                );
              })}
          </CardFooter>
        </Card>
      </div>
      <Divider className="my-4" />
    </>
  );
}

export default TicketTopic;
